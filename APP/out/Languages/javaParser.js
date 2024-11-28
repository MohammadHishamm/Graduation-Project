"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.javaParser = void 0;
const ASTParser_1 = require("../Core/ASTParser");
const tree_sitter_java_1 = __importDefault(require("tree-sitter-java"));
class javaParser extends ASTParser_1.ASTParser {
    selectLanguage() {
        this.parser.setLanguage(tree_sitter_java_1.default); // Use Java grammar
    }
}
exports.javaParser = javaParser;
//# sourceMappingURL=javaParser.js.map