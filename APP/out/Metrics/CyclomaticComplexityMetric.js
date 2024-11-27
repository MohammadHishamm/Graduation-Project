"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CyclomaticComplexityMetric = void 0;
const MetricCalculator_1 = require("../Core/MetricCalculator");
class CyclomaticComplexityMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let complexity = 1; // Starts at 1 for the method itself
        const traverse = (currentNode) => {
            if (['if_statement', 'for_statement', 'while_statement', 'switch_statement', 'catch_clause'].includes(currentNode.type)) {
                complexity++;
            }
            if (currentNode.children) {
                currentNode.children.forEach(traverse);
            }
        };
        traverse(node);
        return complexity;
    }
}
exports.CyclomaticComplexityMetric = CyclomaticComplexityMetric;
//# sourceMappingURL=CyclomaticComplexityMetric.js.map