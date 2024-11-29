"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaCognitiveComplexityMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaCognitiveComplexityMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let complexity = 0;
        const traverse = (currentNode) => {
            // Check for common flow-breaking structures
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
            // Recursion cycle method (increment when a method call is part of recursion)
            if (currentNode.type === 'function_call' && this.isRecursion(currentNode)) {
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
    // Helper function to detect recursion (this could depend on how functions/methods are structured in the AST)
    isRecursion(node) {
        // Check if the function name matches the current function's name (simplified assumption)
        // You may need to implement a more accurate way to identify recursion, depending on your AST structure
        if (node.children && node.children.some((child) => child.type === 'identifier' && child.text === 'currentFunctionName')) {
            return true;
        }
        return false;
    }
}
exports.JavaCognitiveComplexityMetric = JavaCognitiveComplexityMetric;
//# sourceMappingURL=JavaCognetiveComplexityMetric.js.map