
export abstract class MetricCalculator {
    
    abstract calculate(node: any, sourceCode: string): number;

    protected countLines(sourceCode: string): number {
        return sourceCode.split('\n').filter(line => line.trim() !== '').length;
    }
}
