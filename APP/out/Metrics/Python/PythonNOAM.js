"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonNumberOfAccessorMethods = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class PythonNumberOfAccessorMethods extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let accessorCounter = 0;
        let valid = false;
        const traverse = (currentNode) => {
            // Check if the current node is a class definition
            if (currentNode.type === "class_definition") {
                valid = true;
            }
            // Count getter and setter methods (functions with 'get' or 'set' prefix)
            if (valid && currentNode.type === 'function_definition') {
                if (currentNode.text.includes("get") || currentNode.text.includes("set")) {
                    accessorCounter++;
                }
            }
            // Recursively traverse the children nodes
            if (currentNode.children) {
                currentNode.children.forEach((child) => traverse(child));
            }
        };
        traverse(node); // Start traversal from the root node
        return accessorCounter;
    }
}
exports.PythonNumberOfAccessorMethods = PythonNumberOfAccessorMethods;
//# sourceMappingURL=PythonNOAM.js.map