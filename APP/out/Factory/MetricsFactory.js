"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const JavaLOC_1 = require("../Metrics/Java/JavaLOC");
const JavaCC_1 = require("../Metrics/Java/JavaCC");
const PythonCC_1 = require("../Metrics/Python/PythonCC");
// import {PythonCognitiveComplexityMetric} from '../Metrics/Python/PythonCoC';
const JavaNOA_1 = require("../Metrics/Java/JavaNOA");
const JavaNOM_1 = require("../Metrics/Java/JavaNOM");
const PythonLOC_1 = require("../Metrics/Python/PythonLOC");
const PythonNOA_1 = require("../Metrics/Python/PythonNOA");
class MetricsFactory {
    static createMetric(metricName, language) {
        switch (metricName) {
            case 'LOC':
                if (language === 'java') {
                    return new JavaLOC_1.JavaLOCMetric();
                }
                else if (language === 'python') {
                    return new PythonLOC_1.PythonLOCMetric();
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
                    return new PythonNOA_1.PythonNumberofAttributesMetric();
                }
            case 'NOM':
                if (language === 'java') {
                    return new JavaNOM_1.JavaNumberOfMethodsMetric();
                }
                else {
                }
            default:
                return null;
        }
    }
}
exports.MetricsFactory = MetricsFactory;
//# sourceMappingURL=MetricsFactory.js.map