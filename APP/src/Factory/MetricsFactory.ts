import { MetricCalculator } from '../Core/MetricCalculator';

import { JavaLOCMetric } from '../Metrics/Java/JavaLOC';
import { JavaCyclomaticComplexityMetric } from '../Metrics/Java/JavaCC';
import { JavaNumberOfAccessorMethods } from '../Metrics/Java/JavaNOAM';
import { JavaCognitiveComplexityMetric } from '../Metrics/Java/JavaCoC';
import { JavaNumberOfAttributesMetric } from '../Metrics/Java/JavaNOA';
import { JavaNumberOfMethodsMetric } from '../Metrics/Java/JavaNOM';
import { JavaNumberOfPublicAttributesM } from '../Metrics/Java/JavaNOPA';
import { JavaNumberOfAbstractClassesM } from '../Metrics/Java/JavaNAbsm';
import { JavaNumberOfProtectedMethodsMetric } from '../Metrics/Java/JavaNProtM';
import { JavaFanOutMetric } from '../Metrics/Java/JavaFANOUT';




import { PythonCyclomaticComplexityMetric } from '../Metrics/Python/PythonCC';
import { PythonLOCMetric } from '../Metrics/Python/PythonLOC';
import { PythonNumberofAttributesMetric } from '../Metrics/Python/PythonNOA';
import { PythonNumberOfAccessorMethods } from '../Metrics/Python/PythonNOAM';
import { PythonNumberOfMethodsMetric } from '../Metrics/Python/PythonNOM';



export class MetricsFactory {
    // Public static method to create a metric object based on the language and metric name
    public static CreateMetric(metricName: string, language: string): MetricCalculator | null {
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
    private static createJavaMetric(metricName: string): MetricCalculator | null {
        switch (metricName) {
            case 'LOC':
                return new JavaLOCMetric();
            case 'CC':
                return new JavaCyclomaticComplexityMetric();
            case 'NOA':
                return new JavaNumberOfAttributesMetric();
            case 'NOM':
                return new JavaNumberOfMethodsMetric();
            case 'NOAM':
                return new JavaNumberOfAccessorMethods();
            case 'NOPA':
                return new JavaNumberOfPublicAttributesM();   
            case 'NAbsm':
                return new JavaNumberOfAbstractClassesM();       
            case 'NProtM':
                return new JavaNumberOfProtectedMethodsMetric();    
            case 'CognitiveComplexity':
                return new JavaCognitiveComplexityMetric();
            case 'FANOUT':    
                return new JavaFanOutMetric();
            default:
                return null;
        }
    }

    // Dynamically create Python metric object
    private static createPythonMetric(metricName: string): MetricCalculator | null {
        switch (metricName) {
            case 'LOC':
                return new PythonLOCMetric();
            case 'CC':
                return new PythonCyclomaticComplexityMetric();
            case 'NOA':
                return new PythonNumberofAttributesMetric();
            case 'NOM':
                return new PythonNumberOfMethodsMetric();
            case 'NOAM':
                return new PythonNumberOfAccessorMethods();
            default:
                return null;
        }
    }
}
