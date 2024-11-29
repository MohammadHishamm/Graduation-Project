"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonCyclomaticComplexityMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class PythonCyclomaticComplexityMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let complexity = 0;
        const traverse = (currentNode) => {
            // Increment for control flow statements
            if ([
                'if_statement', // for 'if'
                'for_statement', // for 'for'
                'while_statement', // for 'while'
                'with_statement', // for 'with'
                'except_clause', // for 'catch'
                'raise_statement', // for 'throw'
                'break_statement', // for 'break'
                'case', // for 'cases in the switch case'
                'continue_statement' // for 'continue'
            ].includes(currentNode.type)) {
                complexity++;
            }
            if (currentNode.type === 'function_definition') {
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
exports.PythonCyclomaticComplexityMetric = PythonCyclomaticComplexityMetric;
//# sourceMappingURL=PythonCyclomaticComplexityMetric.js.map