import { MetricCalculator } from "../../Core/MetricCalculator";

import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";

import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
import { MethodInfo } from "../../Interface/MethodInfo";

export class JavaDataAbstractionCoupling extends MetricCalculator {
  calculate(node: any, sourceCode: string, FECFC: FolderExtractComponentsFromCode, Filename: string): number 
  { 
    let allClasses: ClassInfo[] = [];
    let allMethods: MethodInfo[] = [];
    let allFields: FieldInfo[] = [];

    const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);

    if (fileParsedComponents) 
    {
      const classGroups = fileParsedComponents.classes;
      classGroups.forEach((classGroup) => 
      {
        allClasses = [...allClasses, ...classGroup.classes];
        allMethods = [...allMethods, ...classGroup.methods];
        allFields = [...allFields, ...classGroup.fields];
      });
    }

    const DAC = this.findDataAbstractionCoupling(allFields);

    return DAC;
  }

  private findDataAbstractionCoupling(Fields: FieldInfo[]): number {
    let DAC = 0; // Initialize DAC counter
    const usedClassTypes = new Set<string>(); // To track unique types

    // List of primitive types to ignore
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
    ]);

    for (const field of Fields) {
      const fieldType = field.type;

      if (!fieldType) {
        return DAC;
      }

      // Extract generic types if present (e.g., "List<Book>")
      const genericMatch = fieldType.match(/^(\w+)<(.+)>$/);
      if (!genericMatch) {
        if (
          !primitiveTypes.has(fieldType.toLowerCase()) &&
          !usedClassTypes.has(fieldType)
        ) {
          usedClassTypes.add(fieldType);
          DAC++;
        }
      }
    }

    return DAC; // Return the final count
  }
}
