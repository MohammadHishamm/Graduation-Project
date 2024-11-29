"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pythonParser = void 0;
const ASTParser_1 = require("../Core/ASTParser");
const tree_sitter_python_1 = __importDefault(require("tree-sitter-python"));
class pythonParser extends ASTParser_1.ASTParser {
    selectLanguage() {
        this.parser.setLanguage(tree_sitter_python_1.default); // Use Python grammar
    }
}
exports.pythonParser = pythonParser;
//# sourceMappingURL=pythonParser.js.map