"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaLOCMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaLOCMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode) {
        const startLine = node.startPosition.row; // Get start line of the node
        const endLine = node.endPosition.row; // Get end line of the node
        // Return the number of lines between start and end (inclusive)
        return endLine - startLine + 1;
    }
}
exports.JavaLOCMetric = JavaLOCMetric;
//# sourceMappingURL=JavaLOC.js.map