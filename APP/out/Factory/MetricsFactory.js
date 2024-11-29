"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const LOCMetric_1 = require("../Metrics/LOCMetric");
const JavaCognitiveComplexityMetric_1 = require("../Metrics/Java/JavaCognitiveComplexityMetric");
const PythonCognitivecomplexty_1 = require("../Metrics/Python/PythonCognitivecomplexty");
const JavaNumberOfAttributes_1 = require("../Metrics/Java/JavaNumberOfAttributes");
const JavaNumberOfMethods_1 = require("../Metrics/Java/JavaNumberOfMethods");
class MetricsFactory {
    static createMetric(metricName, language) {
        switch (metricName) {
            case 'LOC':
                return new LOCMetric_1.LOCMetric();
            // case 'CyclomaticComplexity':
            //     if (language === 'java') {
            //         return new JavaCyclomaticComplexityMetric();
            //     } else if (language === 'python') {
            //         return new PythonCyclomaticComplexityMetric();
            //     } else {
            //         throw new Error(`Unsupported language for Cyclomatic Complexity: ${language}`);
            //     }
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
            case 'NumberOfMethods':
                if (language === 'java') {
                    return new JavaNumberOfMethods_1.JavaNumberOfMethodsMetric();
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