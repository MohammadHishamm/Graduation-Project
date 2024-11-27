import { MetricCalculator } from '../Core/MetricCalculator';

export class LOCMetric extends MetricCalculator {
    calculate(node: any, sourceCode: string): number {
        return this.countLines(sourceCode);
    }
}
