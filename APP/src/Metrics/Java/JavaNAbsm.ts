import { MetricCalculator } from '../../Core/MetricCalculator';
import { FileParsedComponents } from '../../Interface/FileParsedComponents';

export class JavaNumberOfAbstractClassesM extends MetricCalculator {

    
    calculate(node: any): number {
        let abstractClassCount = 0;

        const traverse = (currentNode: any) => {
            // Check if the current node is a class declaration
            if (currentNode.type === 'class_declaration') {
                // Check for the "abstract" modifier in the class declaration
                const modifiers = currentNode.children.find((child: any) => child.type === 'modifiers');
                if (modifiers && modifiers.children.some((modifier: any) => modifier.type === 'abstract')) {
                    abstractClassCount++;
                }
            }

            // Continue traversing through child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };

        // Start traversal from the root node
        traverse(node);
        return abstractClassCount;
    }
}
