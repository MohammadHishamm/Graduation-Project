import { MetricCalculator } from '../Core/MetricCalculator';

export class MethodCountMetric extends MetricCalculator {
    calculate(node: any): number {
        let methodCount = 0;

        const traverse = (currentNode: any, parentNodeType: string | null) => {
            if (
                (currentNode.type === 'method_declaration') || // For Java
                (currentNode.type === 'function_definition') // For Python
            ) {
                methodCount++;
            }

            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child, currentNode.type); // Pass parent node type
                }
            }
        };

        traverse(node, null);
        return methodCount;
    }
}
