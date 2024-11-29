"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const JavaLOC_1 = require("../Metrics/Java/JavaLOC");
const JavaCC_1 = require("../Metrics/Java/JavaCC");
const PythonCC_1 = require("../Metrics/Python/PythonCC");
const JavaNOA_1 = require("../Metrics/Java/JavaNOA");
const JavaNOM_1 = require("../Metrics/Java/JavaNOM");
class MetricsFactory {
    static createMetric(metricName, language) {
        switch (metricName) {
            case 'LOC':
                if (language === 'java') {
                    return new JavaLOC_1.JavaLOCMetric();
                }
                else if (language === 'python') {
                }
            case 'CC':
                if (language === 'java') {
                    return new JavaCC_1.JavaCyclomaticComplexityMetric();
                }
                else if (language === 'python') {
                    return new PythonCC_1.PythonCyclomaticComplexityMetric();
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
                    return new JavaNOA_1.JavaNumberOfAttributesMetric();
                }
                else {
                    throw new Error(`Unsupported language for Number of Attributes: ${language}`);
                }
            case 'NOM':
                if (language === 'java') {
                    return new JavaNOM_1.JavaNumberOfMethodsMetric();
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