"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const LOCMetric_1 = require("../Metrics/LOCMetric");
const MethodCountMetric_1 = require("../Metrics/MethodCountMetric");
const JavaCyclomaticComplexityMetric_1 = require("../Metrics/Java/JavaCyclomaticComplexityMetric");
const PythonCyclomaticComplexityMetric_1 = require("../Metrics/Python/PythonCyclomaticComplexityMetric");
const JavaCognitiveComplexityMetric_1 = require("../Metrics/Java/JavaCognitiveComplexityMetric");
const PythonCognitivecomplexty_1 = require("../Metrics/Python/PythonCognitivecomplexty");
const JavaNumberOfAttributes_1 = require("../Metrics/Java/JavaNumberOfAttributes");
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
            case 'CognetiveComplexity':
                if (language === 'java') {
                    return new JavaCognitiveComplexityMetric_1.JavaCognitiveComplexityMetric();
                }
                else if (language === 'python') {
                    return new PythonCognitivecomplexty_1.PythonCognitiveComplexityMetric();
                }
            case 'NumberOfAttributes':
                if (language === 'java') {
                    return new JavaNumberOfAttributes_1.JavaNumberOfAttributesMetric();
                }
                else {
                    throw new Error(`Unsupported language for Number of Attributes: ${language}`);
                }
            default:
                return null;
        }
    }
}
exports.MetricsFactory = MetricsFactory;
//# sourceMappingURL=MetricsFactory.js.map