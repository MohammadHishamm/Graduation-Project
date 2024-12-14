import { MetricCalculator } from '../../Core/MetricCalculator';
import { FileParsedComponents } from '../../Interface/FileParsedComponents';

export class JavaNumberOfProtectedMethodsMetric extends MetricCalculator {

    
    calculate(node: any): number {
        let numberOfProtectedMethods = 0;

        const traverse = (currentNode: any) => {
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_declaration') {
                // Traverse the class body to count method declarations
                const classBody = currentNode.children.find((child: any) => child.type === 'class_body');
                if (classBody && classBody.children) {
                    for (const child of classBody.children) {
                        // Check for method declarations
                        if (child.type === 'method_declaration' ) {
                            // Check for the "protected" modifier in the method
                            const modifiers = child.children.find((subChild: any) => subChild.type === 'modifiers');
                            if (modifiers && modifiers.children.some((modifier: any) => modifier.type === 'protected')) {
                                numberOfProtectedMethods++;
                            }
                        }
                    }
                }
            }

            // Traverse through child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };

        traverse(node);
        return numberOfProtectedMethods;
    }
}
