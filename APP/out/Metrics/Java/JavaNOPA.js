"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfPublicAttributesM = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfPublicAttributesM extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let numberOfAttributes = 0;
        const traverse = (currentNode) => {
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_declaration') {
                // Traverse only the class's body to count field declarations
                const classBody = currentNode.children.find((child) => child.type === 'class_body');
                if (classBody && classBody.children) {
                    for (const child of classBody.children) {
                        // Check if the child is a field declaration
                        if (child.type === 'field_declaration') {
                            // Check for public modifier in the field declaration
                            const modifiers = child.children.find((subChild) => subChild.type === 'modifiers');
                            if (modifiers && modifiers.children.some((modifier) => modifier.type === 'public')) {
                                numberOfAttributes++;
                            }
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
exports.JavaNumberOfPublicAttributesM = JavaNumberOfPublicAttributesM;
//# sourceMappingURL=JavaNOPA.js.map