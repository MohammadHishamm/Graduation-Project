"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonCognitiveComplexityMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class PythonCognitiveComplexityMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let complexity = 0;
        const traverse = (currentNode) => {
            // Increment for control flow statements
            if ([
                'if_statement', // for 'if'
                'elif_clause', // else if
                'else_clause', // else 
                'for_statement', // for 'for'
                'while_statement', // for 'while'
                'with_statement', // for 'with'
                'except_clause', // for 'catch'
                'match ', // for 'switchcase'
                'raise_statement', // for 'throw'
                'break_statement', // for 'break'
                'continue_statement' // for 'continue'        
            ].includes(currentNode.type)) {
                complexity++;
            }
            if (currentNode.type === 'function_definition') {
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
exports.PythonCognitiveComplexityMetric = PythonCognitiveComplexityMetric;
//# sourceMappingURL=PythonCoc.js.map