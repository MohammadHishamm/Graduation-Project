"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaMetricsExtractor = void 0;
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_java_1 = __importDefault(require("tree-sitter-java"));
class JavaMetricsExtractor {
    parser;
    constructor() {
        this.parser = new tree_sitter_1.default();
        this.parser.setLanguage(tree_sitter_java_1.default);
    }
    extractMetrics(sourceCode) {
        const tree = this.parser.parse(sourceCode);
        const rootNode = tree.rootNode;
        let loc = 0; // Lines of Code
        let numberOfClasses = 0; // Number of classes
        let numberOfMethods = 0; // Number of methods
        let cyclomaticComplexity = 0; // Cyclomatic complexity
        const lines = sourceCode.split('\n'); // Split source code into individual lines
        const nonEmptyCodeLines = new Set(); // Track non-empty code lines
        // Recursive function to walk through syntax tree nodes
        const walkNode = (node) => {
            const type = node.type;
            const startRow = node.startPosition.row;
            const endRow = node.endPosition.row;
            // Mark lines as containing code (exclude comments)
            if (type !== 'line_comment' && type !== 'block_comment') {
                for (let row = startRow; row <= endRow; row++) {
                    nonEmptyCodeLines.add(row);
                }
            }
            // Count classes
            if (type === 'class_declaration') {
                numberOfClasses++;
            }
            // Count methods
            if (type === 'method_declaration') {
                numberOfMethods++;
            }
            // Increment cyclomatic complexity for control structures
            if ([
                'if_statement',
                'for_statement',
                'while_statement',
                'switch_statement',
                'catch_clause',
            ].includes(type)) {
                cyclomaticComplexity++;
            }
            // Recursively process child nodes
            if (node.children) {
                node.children.forEach(walkNode);
            }
        };
        // Start traversing the syntax tree from the root node
        walkNode(rootNode);
        // Calculate LOC by excluding empty lines and comments
        for (let i = 0; i < lines.length; i++) {
            const trimmedLine = lines[i].trim();
            if (nonEmptyCodeLines.has(i) && trimmedLine !== '' && !trimmedLine.startsWith('//')) {
                loc++;
            }
        }
        // Each method contributes a base complexity of 1
        cyclomaticComplexity += numberOfMethods;
        return { loc, numberOfClasses, numberOfMethods, cyclomaticComplexity };
    }
}
exports.JavaMetricsExtractor = JavaMetricsExtractor;
//# sourceMappingURL=extractJavaMetrics.js.map