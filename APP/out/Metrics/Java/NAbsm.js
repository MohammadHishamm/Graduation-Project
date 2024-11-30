"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfAbstractClassesM = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfAbstractClassesM extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let abstractClassCount = 0;
        const traverse = (currentNode) => {
            // Check if the current node is a class declaration
            if (currentNode.type === 'class_declaration') {
                // Check for the "abstract" modifier in the class declaration
                const modifiers = currentNode.children.find((child) => child.type === 'modifiers');
                if (modifiers && modifiers.children.some((modifier) => modifier.type === 'abstract')) {
                    abstractClassCount++;
                }
            }
            // Continue traversing through child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };
        // Start traversal from the root node
        traverse(node);
        return abstractClassCount;
    }
}
exports.JavaNumberOfAbstractClassesM = JavaNumberOfAbstractClassesM;
//# sourceMappingURL=NAbsm.js.map