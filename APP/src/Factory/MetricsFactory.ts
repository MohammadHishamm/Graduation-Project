import { MetricCalculator } from '../Core/MetricCalculator';
import { LOCMetric } from '../Metrics/LOCMetric';
import { MethodCountMetric } from '../Metrics/MethodCountMetric';
import { JavaCyclomaticComplexityMetric } from '../Metrics/Java/JavaCyclomaticComplexityMetric';
import { PythonCyclomaticComplexityMetric } from '../Metrics/Python/PythonCyclomaticComplexityMetric';
import {JavaCognitiveComplexityMetric} from '../Metrics/Java/JavaCognitiveComplexityMetric';
import {PythonCognitiveComplexityMetric} from '../Metrics/Python/PythonCognitivecomplexty';
import { JavaNumberOfAttributesMetric } from '../Metrics/Java/JavaNumberOfAttributes';

export class MetricsFactory {
    public static createMetric(metricName: string, language: string): MetricCalculator | null {
        switch (metricName) {
            case 'LOC':
                return new LOCMetric();
            case 'MethodCount':
                return new MethodCountMetric();
            case 'CyclomaticComplexity':
                if (language === 'java') {
                    return new JavaCyclomaticComplexityMetric();
                } else if (language === 'python') {
                    return new PythonCyclomaticComplexityMetric();
                } else {
                    throw new Error(`Unsupported language for Cyclomatic Complexity: ${language}`);
                }
            case 'CognetiveComplexity':
                if(language==='java'){
                return new JavaCognitiveComplexityMetric();
                } else if (language==='python'){
                        return new PythonCognitiveComplexityMetric();
                }     
                case 'NumberOfAttributes':
                    if (language === 'java') {
                        return new JavaNumberOfAttributesMetric();
                    } else {
                        throw new Error(`Unsupported language for Number of Attributes: ${language}`);
                    }
                default:
                    return null;
        }
    }
}
