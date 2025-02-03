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

    // System and standard library packages to exclude
    const systemPackages = new Set([
      "System",
      "Math",
      "Arrays",
      "Collections",
      "List",
      "Map",
      "Set",
      "out",
      "print",
      "println",
      "console",
      "Integer",
      "Double",
      "Boolean",
      "String",
    ]);

    // Helper: Check if a type is foreign
    const isForeignClass = (type: string): boolean => {
      const baseType = type.split("<")[0].trim();
      return (
        !primitiveTypes.has(baseType) &&
        baseType !== currentClassName &&
        !systemPackages.has(baseType)
      );
    };

    // Process methods to find usage of foreign class method calls
    methods.forEach((method) => {
      method.methodCalls.forEach((methodCall) => {
        // Only process method calls with a dot
        if (!methodCall.includes(".")) return;

        // Split the method call and take the first part
        const objectName = methodCall.split(".")[0];

        // Skip primitive or current class names or system packages
        if (
          primitiveTypes.has(objectName) ||
          objectName === currentClassName ||
          systemPackages.has(objectName)
        ) {
          return;
        }

        // If the object name is not a primitive and not the current class
        if (isForeignClass(objectName)) {
          foreignClassesAccessed.add(objectName);
          console.log(
            `[FDP] Found usage of foreign class through method call: ${methodCall}`
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
