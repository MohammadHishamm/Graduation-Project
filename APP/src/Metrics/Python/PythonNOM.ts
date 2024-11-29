import { MetricCalculator } from '../../Core/MetricCalculator';

export class PythonNumberOfMethodsMetric extends MetricCalculator {
    calculate(node: any, sourceCode: string): number {
        let numberOfMethods = 0;

        const traverse = (currentNode: any) => {
            // Check if the current node is a class definition
            if (currentNode.type === 'class_definition') {
                // Iterate over the children of the class
                for (const child of currentNode.namedChildren) {
                    // Check for method definitions (function definitions inside the class)
                    if (child.type === 'function_definition') {
                        numberOfMethods++;
                    }
                }
            }

            // Recursively traverse child nodes
            if (currentNode.namedChildren) {
                for (const child of currentNode.namedChildren) {
                    traverse(child);
                }
            }
        };

        // Start traversing from the root node
        traverse(node);

        return numberOfMethods;
    }
}
