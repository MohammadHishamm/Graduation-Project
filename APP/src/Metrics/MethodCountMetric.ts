import { MetricCalculator } from '../Core/MetricCalculator';

export class MethodCountMetric extends MetricCalculator {
    calculate(node: any): number {
        let methodCount = 0;

        const traverse = (currentNode: any) => {
            if (currentNode.type === 'method_declaration') {
                methodCount++;
            }
            if (currentNode.children) {
                currentNode.children.forEach(traverse);
            }
        };

        traverse(node);
        return methodCount;
    }
}
