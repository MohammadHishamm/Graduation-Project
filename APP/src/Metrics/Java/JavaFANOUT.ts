import { MetricCalculator } from '../../Core/MetricCalculator';

export class JavaFanOutMetric extends MetricCalculator {
    calculate(node: any): number {
        const calledClasses = new Set<string>();

        const traverse = (currentNode: any) => {
            // Look for method calls or object instantiations
            if (currentNode.type === 'method_invocation' || currentNode.type === 'object_creation') {
                // Extract the class name being referenced
                const classNameNode = currentNode.children.find((child: any) => child.type === 'identifier');
                if (classNameNode) {
                    calledClasses.add(classNameNode.text);
                }
            }

            // Recursively traverse all child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };

        // Start traversal from the root node
        traverse(node);

        // Return the number of unique classes referenced
        return calledClasses.size;
    }
}
