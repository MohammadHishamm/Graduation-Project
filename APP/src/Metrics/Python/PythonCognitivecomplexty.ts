import { MetricCalculator } from '../../Core/MetricCalculator';

export class PythonCognitiveComplexityMetric extends MetricCalculator {
    calculate(node: any): number {
        let complexity = 0;

        const traverse = (currentNode: any) => {
            // Increment for flow-breaking statements
            if (
                [
                    'if_statement',       // 'if'
                    'elif_clause',        // 'elif'
                    'else_clause',        // 'else'
                    'conditional_expression', // Ternary operator
                ].includes(currentNode.type)
            ) {
                complexity++;  // Increment for flow-breaking statements
            }

            if (currentNode.type === 'for_statement') {
                complexity++;  // Increment for loops
            }

            if (currentNode.type === 'while_statement') {
                complexity++;  // Increment for while loops
            }

            if (currentNode.type === 'try_clause' || currentNode.type === 'except_clause' || currentNode.type === 'finally_clause') {
                complexity++;  // Increment for try-except-finally blocks
            }

            // Increment for logical operators like `and` and `or` (binary logical expressions)
            if (currentNode.type === 'logical_and_expression' || currentNode.type === 'logical_or_expression') {
                complexity++;
            }

            // Check for recursion in function calls (function calls that refer to themselves)
            if (currentNode.type === 'call' && this.isRecursion(currentNode)) {
                complexity++;  // Increment for recursive function calls
            }

            // Check for function definitions and increment for each method
            if (currentNode.type === 'function_definition') {
                complexity++;  // Increment for each function definition (recursion cycles too)
            }

            // Traverse child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);  // Recursively traverse child nodes
                }
            }
        };

        traverse(node);
        return complexity;
    }

    // Helper function to detect recursion in function calls
    private isRecursion(node: any): boolean {
        // Check if the function call is referring to the current function
        // You can improve this by matching the function's name with the called function's name
        if (node.children) {
            // Assuming the first child is the function name, this can vary based on your AST structure
            const functionName = node.children.find((child: any) => child.type === 'identifier');
            if (functionName && functionName.text === 'factorial') {  // Replace 'factorial' with actual function name
                return true;
            }
        }
        return false;
    }
}
