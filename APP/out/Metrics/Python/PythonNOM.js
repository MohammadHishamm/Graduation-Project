"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonNumberOfMethodsMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class PythonNumberOfMethodsMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode) {
        let numberOfMethods = 0;
        const traverse = (currentNode) => {
            // Check if the current node is a class definition
            if (currentNode.type === 'class_definition') {
                // Iterate over the children of the class
                for (const child of currentNode.namedChildren) {
                    // Check for method definitions (function definitions inside the class)
                    if (child.type === 'function_definition') {
                        numberOfMethods++;
                    }
                }
            }
            // Recursively traverse child nodes
            if (currentNode.namedChildren) {
                for (const child of currentNode.namedChildren) {
                    traverse(child);
                }
            }
        };
        // Start traversing from the root node
        traverse(node);
        return numberOfMethods;
    }
}
exports.PythonNumberOfMethodsMetric = PythonNumberOfMethodsMetric;
//# sourceMappingURL=PythonNOM.js.map