"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfProtectedMethodsMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfProtectedMethodsMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let numberOfProtectedMethods = 0;
        const traverse = (currentNode) => {
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_declaration') {
                // Traverse the class body to count method declarations
                const classBody = currentNode.children.find((child) => child.type === 'class_body');
                if (classBody && classBody.children) {
                    for (const child of classBody.children) {
                        // Check for method declarations
                        if (child.type === 'method_declaration') {
                            // Check for the "protected" modifier in the method
                            const modifiers = child.children.find((subChild) => subChild.type === 'modifiers');
                            if (modifiers && modifiers.children.some((modifier) => modifier.type === 'protected')) {
                                numberOfProtectedMethods++;
                            }
                        }
                    }
                }
            }
            // Traverse through child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };
        traverse(node);
        return numberOfProtectedMethods;
    }
}
exports.JavaNumberOfProtectedMethodsMetric = JavaNumberOfProtectedMethodsMetric;
//# sourceMappingURL=JavaNProtM.js.map