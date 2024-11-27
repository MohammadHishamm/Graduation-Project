import { MetricCalculator } from '../Core/MetricCalculator';

export class MethodCountMetric extends MetricCalculator {
    calculate(node: any): number {
        let methodCount = 0;

        const traverse = (currentNode: any) => {
            if (currentNode.type === 'method_declaration') {
                methodCount++;
            }
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child); // Recursively traverse child nodes
                }
            }
            
        };

        traverse(node);
        return methodCount;
    }
}
