import { MetricCalculator } from '../../Core/MetricCalculator';

export class JavaNumberOfAttributesMetric extends MetricCalculator {
    calculate(node: any): number {
        let numberOfAttributes = 0;

        const traverse = (currentNode: any) => {
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_declaration') {
                // Traverse only the class's body to count field declarations
                const classBody = currentNode.children.find((child: any) => child.type === 'class_body');
                if (classBody && classBody.children) {
                    for (const child of classBody.children) {
                        if (child.type === 'field_declaration') {
                            numberOfAttributes++;
                        }
                    }
                }
            }

            // Avoid traversing deeper into nested methods or irrelevant nodes
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
