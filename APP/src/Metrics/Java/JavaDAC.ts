import { MetricCalculator } from "../../Core/MetricCalculator";
import { FileExtractComponentsFromCode } from "../../Extractors/FileExtractComponentsFromCode";

import { FieldInfo } from "../../Interface/FieldInfo";

export class JavaDataAbstractionCoupling extends MetricCalculator {
  calculate(node: any): number {
    const extractcomponentsfromcode = new FileExtractComponentsFromCode();
    const Classes = extractcomponentsfromcode.extractClasses(node);
    const Fields = extractcomponentsfromcode.extractFields(node, Classes);
    const DAC = this.findDataAbstractionCoupling(Fields);

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
