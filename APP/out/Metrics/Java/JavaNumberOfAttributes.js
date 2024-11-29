"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfAttributesMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfAttributesMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let numberOfAttributes = 0;
        const traverse = (currentNode) => {
            // Check for attribute/field declarations
            if (currentNode.type === 'field_declaration') {
                numberOfAttributes++;
            }
            // Recursively traverse child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };
        traverse(node);
        return numberOfAttributes;
    }
}
exports.JavaNumberOfAttributesMetric = JavaNumberOfAttributesMetric;
//# sourceMappingURL=JavaNumberOfAttributes.js.map