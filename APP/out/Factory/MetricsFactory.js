"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const LOCMetric_1 = require("../Metrics/LOCMetric");
const JavaCyclomaticComplexityMetric_1 = require("../Metrics/Java/JavaCyclomaticComplexityMetric");
const PythonCyclomaticComplexityMetric_1 = require("../Metrics/Python/PythonCyclomaticComplexityMetric");
const JavaNumberOfAttributes_1 = require("../Metrics/Java/JavaNumberOfAttributes");
const JavaNumberOfMethods_1 = require("../Metrics/Java/JavaNumberOfMethods");
class MetricsFactory {
    static createMetric(metricName, language) {
        switch (metricName) {
            case 'LOC':
                return new LOCMetric_1.LOCMetric();
            case 'CC':
                if (language === 'java') {
                    return new JavaCyclomaticComplexityMetric_1.JavaCyclomaticComplexityMetric();
                }
                else if (language === 'python') {
                    return new PythonCyclomaticComplexityMetric_1.PythonCyclomaticComplexityMetric();
                }
                else {
                    throw new Error(`Unsupported language for Cyclomatic Complexity: ${language}`);
                }
            // case 'CognitiveComplexity':
            //     if(language==='java'){
            //     return new JavaCognitiveComplexityMetric();
            //     } else if (language==='python'){
            //             return new PythonCognitiveComplexityMetric();
            //     }     
            case 'NOA':
                if (language === 'java') {
                    return new JavaNumberOfAttributes_1.JavaNumberOfAttributesMetric();
                }
                else {
                    throw new Error(`Unsupported language for Number of Attributes: ${language}`);
                }
            case 'NOM':
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