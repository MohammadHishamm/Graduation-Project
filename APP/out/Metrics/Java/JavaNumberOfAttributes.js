"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfAttributesMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfAttributesMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let numberOfAttributes = 0;
        const traverse = (currentNode) => {
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_declaration') {
                // Traverse only the class's body to count field declarations
                const classBody = currentNode.children.find((child) => child.type === 'class_body');
                if (classBody && classBody.children) {
                    for (const child of classBody.children) {
                        if (child.type === 'field_declaration') {
                            numberOfAttributes++;
                        }
                    }
                }
            }
            // Avoid traversing deeper into nested methods or irrelevant nodes
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