"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const LOCMetric_1 = require("../metrics/LOCMetric");
const MethodCountMetric_1 = require("../metrics/MethodCountMetric");
const CyclomaticComplexityMetric_1 = require("../metrics/CyclomaticComplexityMetric");
class MetricsFactory {
    static createMetric(metricName) {
        switch (metricName) {
            case 'LOC':
                return new LOCMetric_1.LOCMetric();
            case 'MethodCount':
                return new MethodCountMetric_1.MethodCountMetric();
            case 'CyclomaticComplexity':
                return new CyclomaticComplexityMetric_1.CyclomaticComplexityMetric();
            default:
                return null;
        }
    }
}
exports.MetricsFactory = MetricsFactory;
//# sourceMappingURL=MetricsFactory.js.map