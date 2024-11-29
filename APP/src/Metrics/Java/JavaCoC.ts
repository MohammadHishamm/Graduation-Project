import { MetricCalculator } from '../../Core/MetricCalculator';

export class JavaCognitiveComplexityMetric extends MetricCalculator {
    calculate(node: any): number {
        let complexity = 0;
        let currentFunctionName = ""; // Variable to track the current function name

        const traverse = (currentNode: any) => {
            // Detect function declarations and set the current function name
            if (currentNode.type === 'method_declaration') {
                const nameNode = currentNode.children.find((child: any) => child.type === 'identifier');
                if (nameNode) {
                    currentFunctionName = nameNode.text; // Set function name
                }
            }

            // Check for common flow-breaking structures and increment complexity
            if (['if_statement', 'else_if_statement', 'else_statement', 'ternary_operator'].includes(currentNode.type)) {
                complexity++; // Increment for 'if', 'else if', 'else', and ternary operator
            }
        
            if (currentNode.type === 'switch_statement') {
                complexity++; // Increment for 'switch'
            }

            if (['for_statement', 'foreach_statement', 'while_statement', 'do_while_statement'].includes(currentNode.type)) {
                complexity++; // Increment for loops
            }

            if (currentNode.type === 'catch_clause') {
                complexity++; // Increment for 'catch' clauses
            }

            if (['goto_statement', 'break_statement', 'continue_statement'].includes(currentNode.type)) {
                complexity++; // Increment for 'goto', 'break', 'continue'
            }

            // Sequences of binary logical operators (like &&, ||)
            if (currentNode.type === 'logical_and_expression' || currentNode.type === 'logical_or_expression') {
                complexity++; // Increment for sequences of binary logical operators
            }

            // Recursion detection for method calls (check for 'call_expression' node type)
            if (currentNode.type === 'call_expression' && this.isRecursion(currentNode, currentFunctionName)) {
                complexity++; // Increment for recursive method calls
            }

            // Recursively traverse child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };

        traverse(node);
        return complexity;
    }

    // Helper function to detect recursion (checks if the function call matches the current function's name)
    private isRecursion(node: any, functionName: string): boolean {
        if (node.children) {
            const identifierNode = node.children.find((child: any) => child.type === 'identifier');
            if (identifierNode && identifierNode.text === functionName) {
                return true; // Found a recursive function call
            }
        }
        return false;
    }
}
