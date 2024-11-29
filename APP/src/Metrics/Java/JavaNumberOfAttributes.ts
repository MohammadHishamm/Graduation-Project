import { MetricCalculator } from '../../Core/MetricCalculator';

export class JavaNumberOfAttributesMetric extends MetricCalculator {
    calculate(node: any): number {
        let numberOfAttributes = 0;

        const traverse = (currentNode: any) => {
            // Check for attribute/field declarations
            if (currentNode.type === 'field_declaration') {
                numberOfAttributes++;
            }

            // Recursively traverse child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };

        traverse(node);
        return numberOfAttributes;
    }
}
