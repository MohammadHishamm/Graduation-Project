import { ASTParser } from "../Core/ASTParser";
import Python from 'tree-sitter-python';

export class pythonParser extends ASTParser
{
  selectLanguage() {
    this.parser.setLanguage(Python); // Use Python grammar
  }
}