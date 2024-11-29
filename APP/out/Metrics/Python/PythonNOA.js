"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonNumberofAttributesMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class PythonNumberofAttributesMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let numberOfAttributes = 0;
        let classTrigger = false;
        const traverse = (currentNode) => {
            console.log(`${currentNode.type}`);
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_definition') {
                classTrigger = true;
            }
            if (currentNode.type === 'function_definition') {
                classTrigger = false;
            }
            if (currentNode.type === 'assignment' && classTrigger) {
                numberOfAttributes++;
            }
            // Recursively traverse the children nodes
            if (currentNode.children) {
                currentNode.children.forEach((child) => traverse(child));
            }
        };
        traverse(node);
        return numberOfAttributes; // Return the total number of class-level attributes
    }
}
exports.PythonNumberofAttributesMetric = PythonNumberofAttributesMetric;
//# sourceMappingURL=PythonNOA.js.map