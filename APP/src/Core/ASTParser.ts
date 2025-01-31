import Parser from 'tree-sitter';

export abstract class ASTParser {
    public parser: Parser;

    constructor() {
        this.parser = new Parser();
        this.selectLanguage(); // Ensure the language is set in subclasses
    }

    // Each subclass must implement this to set the language
    abstract selectLanguage(): void;

    public parse(sourceCode: string): any {
        if (!this.parser.getLanguage()) {
            throw new Error("Language must be set before parsing.");
        }
        return this.parser.parse(sourceCode).rootNode;
    }
}
