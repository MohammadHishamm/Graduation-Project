import { MetricCalculator } from '../Core/MetricCalculator';
import { JavaLOCMetric } from '../Metrics/Java/JavaLOC';
import { JavaCyclomaticComplexityMetric } from '../Metrics/Java/JavaCC';
import { PythonCyclomaticComplexityMetric } from '../Metrics/Python/PythonCC';
import {JavaCognitiveComplexityMetric} from '../Metrics/Java/JavaCoC';
import {PythonCognitiveComplexityMetric} from '../Metrics/Python/PythonCoC';
import { JavaNumberOfAttributesMetric } from '../Metrics/Java/JavaNOA';
import {JavaNumberOfMethodsMetric} from '../Metrics/Java/JavaNOM';
import {PythonLOCMetric} from '../Metrics/Python/PythonLOC';

export class MetricsFactory {
    public static createMetric(metricName: string, language: string): MetricCalculator | null {
        switch (metricName) {
            case 'LOC':
                if(language==='java')
                {
                return new JavaLOCMetric();
                } else if (language==='python')
                {
                return new PythonLOCMetric();    
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
