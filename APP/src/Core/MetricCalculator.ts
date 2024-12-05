export abstract class MetricCalculator {
  abstract calculate(node: any, sourceCode: string): number;
}
