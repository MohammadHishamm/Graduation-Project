import Parser from "tree-sitter";
import { MetricCalculator } from "../../Core/MetricCalculator";
import { ClassInfo } from "../../Interface/ClassInfo";
import { MethodInfo } from "../../Interface/MethodInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";

export class JavaCouplingBetweenObjects extends MetricCalculator {
  calculate(
    node: any,
    FECFC: FolderExtractComponentsFromCode,
    Filename: string
  ): number {
    console.log("\n[CBO] Starting calculation for file:", Filename);

    let allClasses: ClassInfo[] = [];
    let allMethods: MethodInfo[] = [];
    let allFields: FieldInfo[] = [];

    const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
    if (!fileParsedComponents) {
      console.log("[CBO] No components found in file");
      return 0;
    }

    // Collect all classes, methods, and fields
    const classGroups = fileParsedComponents.classes;
    classGroups.forEach((classGroup) => {
      allClasses = [...allClasses, ...classGroup.classes];
      allMethods = [...allMethods, ...classGroup.methods];
      allFields = [...allFields, ...classGroup.fields];
    });

    console.log(
      "[CBO] Classes found:",
      allClasses.map((c) => c.name)
    );

    // Calculate CBO for each class
    let totalCBO = 0;
    for (const currentClass of allClasses) {
      const classSpecificCBO = this.calculateClassCBO(
        currentClass,
        allClasses,
        allMethods,
        allFields
      );
      totalCBO += classSpecificCBO;
    }

    return totalCBO;
  }

  private calculateClassCBO(
    currentClass: ClassInfo,
    allClasses: ClassInfo[],
    allMethods: MethodInfo[],
    allFields: FieldInfo[]
  ): number {
    const currentClassName = currentClass.name;
    console.log(`[CBO] Calculating CBO for class: ${currentClassName}`);

    // Step 1-2: Find external dependencies through method calls and field accesses
    const externalDependencies = new Set<string>();

    // Primitive types to exclude
    const primitiveTypes = new Set([
      "int",
      "float",
      "double",
      "boolean",
      "char",
      "byte",
      "short",
      "long",
      "void",
      "String",
      "Integer",
      "Float",
      "Double",
      "Boolean",
      "Character",
      "Byte",
      "Short",
      "Long",
      "Void",
    ]);

    // Helper: Check if a type is external
    const isExternalClass = (type: string): boolean => {
      if (!type) return false;
      const baseType = type.split("<")[0].trim();
      return !primitiveTypes.has(baseType) && baseType !== currentClassName;
    };

    // Step 1: Find all methods that the class calls
    const classMethods = allMethods.filter((method) => {
      // Find methods of this class - look for name matches since methodInfo doesn't have className
      return allClasses.some(
        (cls) =>
          cls.name === currentClassName &&
          method.startPosition.row >= cls.startPosition.row &&
          method.endPosition.row <= cls.endPosition.row
      );
    });

    console.log(
      `[CBO] Found ${classMethods.length} methods in class ${currentClassName}`
    );

    // Process method calls
    classMethods.forEach((method) => {
      method.methodCalls.forEach((methodCall) => {
        // Extract the object part (e.g., 'provider' from 'provider.getData')
        const parts = methodCall.split(".");
        if (parts.length > 1) {
          const objectName = parts[0];

          // Check if this object is a field of external type
          const matchingField = allFields.find((field) => {
            const fieldBelongsToClass = allClasses.some(
              (cls) =>
                cls.name === currentClassName &&
                field.startPosition.row >= cls.startPosition.row &&
                field.endPosition.row <= cls.endPosition.row
            );
            return fieldBelongsToClass && field.name === objectName;
          });

          if (matchingField && isExternalClass(matchingField.type)) {
            externalDependencies.add(matchingField.type.split("<")[0]);
            console.log(
              `[CBO] Found call to external class through field: ${objectName} (${matchingField.type})`
            );
          }
        }
      });
    });

    // Step 2: Find all variables the class accesses
    // Process fields used
    classMethods.forEach((method) => {
      method.fieldsUsed.forEach((fieldName) => {
        // Find if this is an external field
        const matchingField = allFields.find(
          (field) => field.name === fieldName && isExternalClass(field.type)
        );

        if (matchingField) {
          const baseType = matchingField.type.split("<")[0];
          externalDependencies.add(baseType);
          console.log(
            `[CBO] Found access to external field: ${fieldName} (${baseType})`
          );
        }
      });

      // Also check local variables of external types
      method.localVariables.forEach((localVar) => {
        // Local variables might contain type and name
        const varParts = localVar.split(" ");
        const varType = varParts.length > 1 ? varParts[0] : localVar;

        if (isExternalClass(varType)) {
          const baseType = varType.split("<")[0];
          externalDependencies.add(baseType);
          console.log(
            `[CBO] Found local variable of external type: ${baseType}`
          );
        }
      });
    });

    // Also include the class's own field types
    const classFields = allFields.filter((field) => {
      return allClasses.some(
        (cls) =>
          cls.name === currentClassName &&
          field.startPosition.row >= cls.startPosition.row &&
          field.endPosition.row <= cls.endPosition.row
      );
    });

    classFields.forEach((field) => {
      if (isExternalClass(field.type)) {
        const baseType = field.type.split("<")[0];
        externalDependencies.add(baseType);
        console.log(
          `[CBO] Found field of external type: ${field.name} (${baseType})`
        );
      }
    });

    // Step 3 & 4: We've collected all dependencies and already kept them unique via Set

    // Step 5: Get all related classes (ancestors)
    const relatedClasses = this.getAncestorClasses(currentClass, allClasses);
    relatedClasses.add(currentClassName); // Add the class itself

    console.log(
      `[CBO] Related classes (self + ancestors): ${Array.from(relatedClasses)}`
    );

    // Step 6: Exclude related classes from dependencies
    for (const relatedClass of relatedClasses) {
      externalDependencies.delete(relatedClass);
    }

    // Step 7: The remaining dependencies are the CBO value
    const cboValue = externalDependencies.size;
    console.log(
      `[CBO] External dependencies for ${currentClassName}: ${Array.from(
        externalDependencies
      )}`
    );
    console.log(`[CBO] Final CBO value for ${currentClassName}: ${cboValue}`);

    return cboValue;
  }

  private getAncestorClasses(
    currentClass: ClassInfo,
    allClasses: ClassInfo[]
  ): Set<string> {
    const ancestors = new Set<string>();

    // Add direct parent (extended class)
    if (currentClass.parent) {
      ancestors.add(currentClass.parent);

      // Recursively add parent's ancestors
      const parentClass = allClasses.find(
        (cls) => cls.name === currentClass.parent
      );
      if (parentClass) {
        const parentAncestors = this.getAncestorClasses(
          parentClass,
          allClasses
        );
        for (const ancestor of parentAncestors) {
          ancestors.add(ancestor);
        }
      }
    }

    // Add interfaces implemented by the class
    if (currentClass.implementedInterfaces) {
      for (const interfaceName of currentClass.implementedInterfaces) {
        ancestors.add(interfaceName);
      }
    }

    return ancestors;
  }
}
