"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaDataAbstractionCoupling = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaDataAbstractionCoupling extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode, FECFC, Filename) {
        let allClasses = [];
        let allMethods = [];
        let allFields = [];
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
        if (fileParsedComponents) {
            const classGroups = fileParsedComponents.classes;
            classGroups.forEach((classGroup) => {
                allClasses = [...allClasses, ...classGroup.classes];
                allMethods = [...allMethods, ...classGroup.methods];
                allFields = [...allFields, ...classGroup.fields];
            });
        }
        const DAC = this.findDataAbstractionCoupling(allFields);
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