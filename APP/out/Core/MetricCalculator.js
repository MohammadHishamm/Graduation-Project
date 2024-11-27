"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricCalculator = void 0;
class MetricCalculator {
    countLines(sourceCode) {
        return sourceCode.split('\n').filter(line => line.trim() !== '').length;
    }
}
exports.MetricCalculator = MetricCalculator;
//# sourceMappingURL=MetricCalculator.js.map