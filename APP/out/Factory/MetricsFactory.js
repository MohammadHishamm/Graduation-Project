"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const LOCMetric_1 = require("../Metrics/LOCMetric");
const MethodCountMetric_1 = require("../Metrics/MethodCountMetric");
const JavaCyclomaticComplexityMetric_1 = require("../Metrics/Java/JavaCyclomaticComplexityMetric");
const PythonCyclomaticComplexityMetric_1 = require("../Metrics/Python/PythonCyclomaticComplexityMetric");
class MetricsFactory {
    static createMetric(metricName, language) {
        switch (metricName) {
            case 'LOC':
                return new LOCMetric_1.LOCMetric();
            case 'MethodCount':
                return new MethodCountMetric_1.MethodCountMetric();
            case 'CyclomaticComplexity':
                if (language === 'java') {
                    return new JavaCyclomaticComplexityMetric_1.JavaCyclomaticComplexityMetric();
                }
                else if (language === 'python') {
                    return new PythonCyclomaticComplexityMetric_1.PythonCyclomaticComplexityMetric();
                }
                else {
                    throw new Error(`Unsupported language for Cyclomatic Complexity: ${language}`);
                }
            default:
                return null;
        }
    }
}
exports.MetricsFactory = MetricsFactory;
//# sourceMappingURL=MetricsFactory.js.map