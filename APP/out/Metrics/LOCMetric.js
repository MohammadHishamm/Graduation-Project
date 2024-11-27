"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOCMetric = void 0;
const MetricCalculator_1 = require("../Core/MetricCalculator");
class LOCMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode) {
        return this.countLines(sourceCode);
    }
}
exports.LOCMetric = LOCMetric;
//# sourceMappingURL=LOCMetric.js.map