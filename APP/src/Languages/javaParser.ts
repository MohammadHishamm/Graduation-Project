import { ASTParser } from "../Core/ASTParser";
import java from 'tree-sitter-java';

export class javaParser extends ASTParser
{
  selectLanguage() {
    this.parser.setLanguage(java); // Use Java grammar
  }
}