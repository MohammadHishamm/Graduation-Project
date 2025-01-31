"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTParser = void 0;
const tree_sitter_1 = __importDefault(require("tree-sitter"));
class ASTParser {
    parser;
    constructor() {
        this.parser = new tree_sitter_1.default();
        this.selectLanguage(); // Ensure the language is set in subclasses
    }
    parse(sourceCode) {
        if (!this.parser.getLanguage()) {
            throw new Error("Language must be set before parsing.");
        }
        return this.parser.parse(sourceCode).rootNode;
    }
}
exports.ASTParser = ASTParser;
//# sourceMappingURL=ASTParser.js.map