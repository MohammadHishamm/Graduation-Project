"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsFactory = void 0;
const JavaLOC_1 = require("../Metrics/Java/JavaLOC");
const JavaCC_1 = require("../Metrics/Java/JavaCC");
const JavaNOAM_1 = require("../Metrics/Java/JavaNOAM");
const JavaCoC_1 = require("../Metrics/Java/JavaCoC");
const JavaNOA_1 = require("../Metrics/Java/JavaNOA");
const JavaNOM_1 = require("../Metrics/Java/JavaNOM");
const JavaNOPA_1 = require("../Metrics/Java/JavaNOPA");
const JavaNAbsm_1 = require("../Metrics/Java/JavaNAbsm");
const JavaNProtM_1 = require("../Metrics/Java/JavaNProtM");
const JavaFANOUT_1 = require("../Metrics/Java/JavaFANOUT");
const PythonCC_1 = require("../Metrics/Python/PythonCC");
const PythonLOC_1 = require("../Metrics/Python/PythonLOC");
const PythonNOA_1 = require("../Metrics/Python/PythonNOA");
const PythonNOAM_1 = require("../Metrics/Python/PythonNOAM");
const PythonNOM_1 = require("../Metrics/Python/PythonNOM");
class MetricsFactory {
    // Public static method to create a metric object based on the language and metric name
    static CreateMetric(metricName, language) {
        switch (language) {
            case 'java':
                return MetricsFactory.createJavaMetric(metricName);
            case 'python':
                return MetricsFactory.createPythonMetric(metricName);
            default:
                return null;
        }
    }
    // Dynamically create Java metric object
    static createJavaMetric(metricName) {
        switch (metricName) {
            case 'LOC':
                return new JavaLOC_1.JavaLOCMetric();
            case 'CC':
                return new JavaCC_1.JavaCyclomaticComplexityMetric();
            case 'NOA':
                return new JavaNOA_1.JavaNumberOfAttributesMetric();
            case 'NOM':
                return new JavaNOM_1.JavaNumberOfMethodsMetric();
            case 'NOAM':
                return new JavaNOAM_1.JavaNumberOfAccessorMethods();
            case 'NOPA':
                return new JavaNOPA_1.JavaNumberOfPublicAttributesM();
            case 'NAbsm':
                return new JavaNAbsm_1.JavaNumberOfAbstractClassesM();
            case 'NProtM':
                return new JavaNProtM_1.JavaNumberOfProtectedMethodsMetric();
            case 'CognitiveComplexity':
                return new JavaCoC_1.JavaCognitiveComplexityMetric();
            case 'FANOUT':
                return new JavaFANOUT_1.JavaFanOutMetric();
            default:
                return null;
        }
    }
    // Dynamically create Python metric object
    static createPythonMetric(metricName) {
        switch (metricName) {
            case 'LOC':
                return new PythonLOC_1.PythonLOCMetric();
            case 'CC':
                return new PythonCC_1.PythonCyclomaticComplexityMetric();
            case 'NOA':
                return new PythonNOA_1.PythonNumberofAttributesMetric();
            case 'NOM':
                return new PythonNOM_1.PythonNumberOfMethodsMetric();
            case 'NOAM':
                return new PythonNOAM_1.PythonNumberOfAccessorMethods();
            default:
                return null;
        }
    }
}
exports.MetricsFactory = MetricsFactory;
//# sourceMappingURL=MetricsFactory.js.map