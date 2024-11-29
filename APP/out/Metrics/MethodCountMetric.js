"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodCountMetric = void 0;
const MetricCalculator_1 = require("../Core/MetricCalculator");
class MethodCountMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let methodCount = 0;
        const traverse = (currentNode, parentNodeType) => {
            if ((currentNode.type === 'method_declaration') || // For Java
                (currentNode.type === 'function_definition') // For Python
            ) {
                methodCount++;
            }
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child, currentNode.type); // Pass parent node type
                }
            }
        };
        traverse(node, null);
        return methodCount;
    }
}
exports.MethodCountMetric = MethodCountMetric;
//# sourceMappingURL=MethodCountMetric.js.map