"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonNumberOfMethodsMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class PythonNumberOfMethodsMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let NumberOfMethods = 0;
        let classTrigger = false;
        const traverse = (currentNode) => {
            console.log(`${currentNode.type}`);
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_definition') {
                classTrigger = true;
            }
            if (currentNode.type === 'function_definition' && classTrigger) {
                NumberOfMethods++;
            }
            console.log(`${currentNode.type}`);
            // Recursively traverse the children nodes
            if (currentNode.children) {
                currentNode.children.forEach((child) => traverse(child));
            }
        };
        traverse(node);
        return NumberOfMethods; // Return the total number of class-level attributes
    }
}
exports.PythonNumberOfMethodsMetric = PythonNumberOfMethodsMetric;
//# sourceMappingURL=PythonNOM.js.map