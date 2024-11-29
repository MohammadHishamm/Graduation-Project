import { MetricCalculator } from '../Core/MetricCalculator';

import { JavaLOCMetric } from '../Metrics/Java/JavaLOC';
import { JavaCyclomaticComplexityMetric } from '../Metrics/Java/JavaCC';
import { JavaNumberOfAccessorMethods } from '../Metrics/Java/JavaNOAM';
import { JavaCognitiveComplexityMetric } from '../Metrics/Java/JavaCoC';
import { JavaNumberOfAttributesMetric } from '../Metrics/Java/JavaNOA';
import { JavaNumberOfMethodsMetric } from '../Metrics/Java/JavaNOM';

import { PythonCyclomaticComplexityMetric } from '../Metrics/Python/PythonCC';
import { PythonLOCMetric } from '../Metrics/Python/PythonLOC';
import { PythonNumberofAttributesMetric } from '../Metrics/Python/PythonNOA';


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
            case 'CognitiveComplexity':
                return new JavaCognitiveComplexityMetric();
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
            default:
                return null;
        }
    }
}
