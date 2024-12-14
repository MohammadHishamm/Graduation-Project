import { MetricCalculator } from '../../Core/MetricCalculator';
import { FileParsedComponents } from '../../Interface/FileParsedComponents';

export class JavaNumberOfPublicAttributesM extends MetricCalculator {

    calculate(node: any): number {
        let numberOfAttributes = 0;

        const traverse = (currentNode: any) => {
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_declaration') {
                // Traverse only the class's body to count field declarations
                const classBody = currentNode.children.find((child: any) => child.type === 'class_body');
                if (classBody && classBody.children) {
                    for (const child of classBody.children) {
                        // Check if the child is a field declaration
                        if (child.type === 'field_declaration') {
                            // Check for public modifier in the field declaration
                            const modifiers = child.children.find((subChild: any) => subChild.type === 'modifiers');
                            if (modifiers && modifiers.children.some((modifier: any) => modifier.type === 'public')) {
                                numberOfAttributes++;
                            }
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
