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
    }
    parse(sourceCode) {
        return this.parser.parse(sourceCode).rootNode; // Parse Python source code
    }
}
exports.ASTParser = ASTParser;
//# sourceMappingURL=ASTParser.js.map