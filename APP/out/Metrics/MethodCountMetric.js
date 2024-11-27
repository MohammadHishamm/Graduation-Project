"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodCountMetric = void 0;
const MetricCalculator_1 = require("../Core/MetricCalculator");
class MethodCountMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let methodCount = 0;
        const traverse = (currentNode) => {
            if (currentNode.type === 'method_declaration') {
                methodCount++;
            }
            if (currentNode.children) {
                currentNode.children.forEach(traverse);
            }
        };
        traverse(node);
        return methodCount;
    }
}
exports.MethodCountMetric = MethodCountMetric;
//# sourceMappingURL=MethodCountMetric.js.map