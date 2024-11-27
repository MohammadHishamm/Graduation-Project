import { MetricCalculator } from '../Core/MetricCalculator';
import { LOCMetric } from '../Metrics/LOCMetric';
import { MethodCountMetric } from '../Metrics/MethodCountMetric';
import { CyclomaticComplexityMetric } from '../Metrics/CyclomaticComplexityMetric';

export class MetricsFactory {
    public static createMetric(metricName: string): MetricCalculator | null {
        switch (metricName) {
            case 'LOC':
                return new LOCMetric();
            case 'MethodCount':
                return new MethodCountMetric();
            case 'CyclomaticComplexity':
                return new CyclomaticComplexityMetric();
            default:
                return null;
        }
    }
}
