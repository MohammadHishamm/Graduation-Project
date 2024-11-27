import { MetricCalculator } from '../Core/MetricCalculator';

export class CyclomaticComplexityMetric extends MetricCalculator {
    calculate(node: any): number {
        let complexity = 1; // Starts at 1 for the method itself

        const traverse = (currentNode: any) => {
            if (['if_statement', 'for_statement', 'while_statement', 'switch_statement', 'catch_clause'].includes(currentNode.type)) {
                complexity++;
            }
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child); // Recursively traverse child nodes
                }
            }
            
        };

        traverse(node);
        return complexity;
    }
}
