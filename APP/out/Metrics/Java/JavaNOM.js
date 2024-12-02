"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfMethodsMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfMethodsMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let methodCount = 0;
        const traverse = (currentNode) => {
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_declaration') {
                // Traverse only the class's body to count field declarations
                const classBody = currentNode.children.find((child) => child.type === 'class_body');
                if (classBody && classBody.children) {
                    for (const child of classBody.children) {
                        if (child.type === 'method_declaration' || child.type === 'constructor_declaration') {
                            methodCount++;
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
        traverse(node); // Start with isInsideClass as false
        return methodCount;
    }
}
exports.JavaNumberOfMethodsMetric = JavaNumberOfMethodsMetric;
//# sourceMappingURL=JavaNOM.js.map