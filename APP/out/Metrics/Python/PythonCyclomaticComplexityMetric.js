"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonCyclomaticComplexityMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class PythonCyclomaticComplexityMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        let complexity = 1; // Base complexity starts at 1
        const traverse = (currentNode) => {
            // Increment for control flow statements
            if ([
                'if_statement', // for 'if'
                'for_statement', // for 'for'
                'while_statement', // for 'while'
                'try_statement', // for 'try'
                'with_statement', // for 'with'
                'catch_clause', // for 'catch'
                'throw_statement', // for 'throw'
                'break_statement', // for 'break'
                'continue_statement' // for 'continue'
            ].includes(currentNode.type)) {
                complexity++;
            }
            // Increment for boolean operators (&&, ||)
            if (currentNode.type === 'binary_operator') {
                if (['and', 'or'].includes(currentNode.text)) { // Checking for 'and'/'or' operators in conditions
                    complexity++;
                }
            }
            // Increment for ternary expressions (?:)
            if (currentNode.type === 'conditional_expression') {
                complexity++; // For ternary: a if b else c
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