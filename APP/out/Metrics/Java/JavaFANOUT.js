"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaFanOutMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaFanOutMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        const calledClasses = new Set();
        const traverse = (currentNode) => {
            // Look for method calls or object instantiations
            if (currentNode.type === 'method_invocation' || currentNode.type === 'object_creation') {
                // Extract the class name being referenced
                const classNameNode = currentNode.children.find((child) => child.type === 'identifier');
                if (classNameNode) {
                    calledClasses.add(classNameNode.text);
                }
            }
            // Recursively traverse all child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };
        // Start traversal from the root node
        traverse(node);
        // Return the number of unique classes referenced
        return calledClasses.size;
    }
}
exports.JavaFanOutMetric = JavaFanOutMetric;
//# sourceMappingURL=JavaFANOUT.js.map