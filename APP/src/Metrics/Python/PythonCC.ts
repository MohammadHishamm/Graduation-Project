



import { MetricCalculator } from '../../Core/MetricCalculator';
import { FileParsedComponents } from '../../Interface/FileParsedComponents';

export class PythonCyclomaticComplexityMetric extends MetricCalculator {

    
    calculate(node: any): number {
        let complexity = 0; 

        const traverse = (currentNode: any) => 
        {

            // Increment for control flow statements
            if (
                [
                    
                    'if_statement',     // for 'if'
                    'elif_clause', // else if

                    'for_statement',    // for 'for'
                    'while_statement',  // for 'while'

                    'with_statement',   // for 'with'
                    'except_clause',     // for 'catch'
                    'raise_statement',  // for 'throw'

                    'case', // for 'cases in the switch case'

                    'break_statement', // for 'break'
                    'continue_statement'// for 'continue'
                    
                    
                ].includes(currentNode.type)
            ) {
                complexity++;
            }

            if(currentNode.type === 'function_definition')
            {
                complexity++;
            }

            // Increment for boolean operators (&&, ||)
            if (currentNode.type === 'and' || currentNode.type === 'or') {
             
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