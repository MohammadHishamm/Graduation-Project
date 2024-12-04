import { MetricCalculator } from '../../Core/MetricCalculator';
import * as vscode from 'vscode';



export class JavaWeightedMethodCount extends MetricCalculator {
    calculate(node: any): number {
        let complexity = 0; 
    
     
        const traverse = (currentNode: any) => 
        {
            // console.log(`${currentNode.type}`);            
            // Increment for each control flow statement
            if ([
                'if_statement', 
                'for_statement', 
                'while_statement', 
                'do_statement', 
                'catch_clause', 
                'case', 
                'throw_statement', 
                'break_statement', 
                'continue_statement'
            ].includes(currentNode.type)) {
                complexity++;
            }

            // Check guard conditions for boolean operators (&&, ||)
            if (currentNode.type === 'condition') { 
                const conditionText = currentNode.text || ''; // Assume 'text' contains the source code of the condition
                const booleanOperators = (conditionText.match(/&&|\|\|/g) || []).length;
                complexity += booleanOperators;
            }

            if(currentNode.type === 'method_declaration'  || currentNode.type === 'constructor_declaration')
            {
                complexity++;
            }
            
            // Increment for ternary conditional expressions (?:)
            if (currentNode.type === 'ternary_expression') {
                complexity++;
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
}
