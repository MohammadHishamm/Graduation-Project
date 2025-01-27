"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaDataAbstractionCoupling = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const ExtractComponentsFromCode_1 = require("../../Extractors/ExtractComponentsFromCode");
class JavaDataAbstractionCoupling extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        const extractcomponentsfromcode = new ExtractComponentsFromCode_1.ExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const Fields = extractcomponentsfromcode.extractFields(node, Classes);
        const DAC = this.findDataAbstractionCoupling(Fields);
        return DAC;
    }
    findDataAbstractionCoupling(Fields) {
        let DAC = 0; // Initialize DAC counter
        const usedClassTypes = new Set(); // To track unique types
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
                if (!primitiveTypes.has(fieldType.toLowerCase()) &&
                    !usedClassTypes.has(fieldType)) {
                    usedClassTypes.add(fieldType);
                    DAC++;
                }
            }
        }
        return DAC; // Return the final count
    }
}
exports.JavaDataAbstractionCoupling = JavaDataAbstractionCoupling;
//# sourceMappingURL=JavaDAC.js.map