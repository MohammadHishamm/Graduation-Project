import Parser from "tree-sitter";

import { MetricCalculator } from "../../Core/MetricCalculator";

import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";

import { MethodInfo } from "../../Interface/MethodInfo";
interface Reference {
  name: string;
  type: "field" | "method";
}

export class JavaAccessofImportData extends MetricCalculator {
  calculate(
    node: any,
    FECFC: FolderExtractComponentsFromCode,
    Filename: string
  ): number {
    console.log("\n[FDP] Starting calculation for file:", Filename);
    let allClasses: ClassInfo[] = [];
    let allMethods: MethodInfo[] = [];
    let allFields: FieldInfo[] = [];

    const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
    console.log("[FDP] Found file components:", !!fileParsedComponents);

    if (fileParsedComponents) {
      const classGroups = fileParsedComponents.classes;
      classGroups.forEach((classGroup) => {
        allClasses = [...allClasses, ...classGroup.classes];
        allMethods = [...allMethods, ...classGroup.methods];
        allFields = [...allFields, ...classGroup.fields];
      });

      console.log(
        "[FDP] Classes found:",
        allClasses.map((c) => c.name)
      );
      allClasses.forEach((cls) => {
        console.log("[FDP] Class:", cls.name, "Parent:", cls.parent || "none");
      });
    }

    return this.calculateFDP(
      node,
      allClasses,
      allMethods,
      allFields,
      FECFC,
      Filename
    );
  }

  private calculateFDP(
    rootNode: Parser.SyntaxNode,
    currentClasses: ClassInfo[],
    methods: MethodInfo[],
    fields: FieldInfo[],
    FECFC: FolderExtractComponentsFromCode,
    Filename: string
  ): number {
    const foreignClassesAccessed = new Set<string>();
    const currentClassName = currentClasses[0]?.name;

    if (!currentClassName) {
      console.log("[FDP] No class found in current file");
      return 0;
    }

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
      "string",
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

    // Helper: Check if a type is foreign
    const isForeignClass = (type: string): boolean => {
      const baseType = type.split("<")[0].trim();
      return !primitiveTypes.has(baseType) && baseType !== currentClassName;
    };

    // Map field names to their types (if foreign)
    const fieldTypes = new Map<string, string>();

    fields.forEach((field) => {
      if (isForeignClass(field.type)) {
        fieldTypes.set(field.name, field.type);
        console.log(
          `[FDP] Found field of foreign type: ${field.name} (${field.type})`
        );
      }
    });

    // Process methods to find usage of foreign class fields, methods, and local variables
    methods.forEach((method) => {
      // Check fields used
      method.fieldsUsed.forEach((fieldName) => {
        for (const [name, type] of fieldTypes) {
          if (fieldName.startsWith(name)) {
            foreignClassesAccessed.add(type);
            console.log(
              `[FDP] Found usage of foreign class ${type} through field ${name}`
            );
          }
        }
      });

      // Check local variables
      method.localVariables.forEach((localVar) => {
        // Skip 'Unknown' placeholders or primitive placeholders
        if (localVar === "Unknown" || primitiveTypes.has(localVar)) return;

        // If local variable is a valid foreign type
        if (isForeignClass(localVar)) {
          foreignClassesAccessed.add(localVar);
          console.log(
            `[FDP] Found local variable of foreign type: ${localVar}`
          );
        }
      });

      // Check method calls
      method.methodCalls.forEach((methodCall) => {
        // Extract the object part of the call (e.g., 'providerA' from 'providerA.getDataA')
        const objectName = methodCall.split(".")[0];

        // If the object matches a foreign field, it's a foreign method call
        if (fieldTypes.has(objectName)) {
          const foreignType = fieldTypes.get(objectName);
          foreignClassesAccessed.add(foreignType!);
          console.log(
            `[FDP] Found usage of foreign class ${foreignType} through method call ${methodCall}`
          );
        }
      });
    });

    const foreignClasses = Array.from(foreignClassesAccessed);
    console.log("\n[FDP] Foreign Classes Accessed:", foreignClasses);
    console.log("[FDP] Total count:", foreignClasses.length);

    return foreignClassesAccessed.size;
  }
}
