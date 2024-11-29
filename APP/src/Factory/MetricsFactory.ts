import { MetricCalculator } from '../Core/MetricCalculator';
import { JavaLOCMetric } from '../Metrics/Java/JavaLOCMetric';
import { JavaCyclomaticComplexityMetric } from '../Metrics/Java/JavaCyclomaticComplexityMetric';
import { PythonCyclomaticComplexityMetric } from '../Metrics/Python/PythonCyclomaticComplexityMetric';
import {JavaCognitiveComplexityMetric} from '../Metrics/Java/JavaCognitiveComplexityMetric';
import {PythonCognitiveComplexityMetric} from '../Metrics/Python/PythonCognitivecomplexty';
import { JavaNumberOfAttributesMetric } from '../Metrics/Java/JavaNumberOfAttributes';
import {JavaNumberOfMethodsMetric} from '../Metrics/Java/JavaNumberOfMethods';

export class MetricsFactory {
    public static createMetric(metricName: string, language: string): MetricCalculator | null {
        switch (metricName) {
            case 'LOC':
                if(language==='java')
                {
                return new JavaLOCMetric();
                } else if (language==='python')
                {
                    
                }
            case 'CC':
                if (language === 'java') {
                    return new JavaCyclomaticComplexityMetric();
                } else if (language === 'python') {
                    return new PythonCyclomaticComplexityMetric();
                } else {
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
                        return new JavaNumberOfAttributesMetric();
                    } else {
                        throw new Error(`Unsupported language for Number of Attributes: ${language}`);
                    }
                case 'NOM':
                        if (language === 'java') {
                            return new JavaNumberOfMethodsMetric();
                        } else {
                            throw new Error(`Unsupported language for Number of Attributes: ${language}`);
                        }
                default:
                return null;    
        }
    }
}
