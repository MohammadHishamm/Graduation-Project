import Parser from 'tree-sitter';
import Java from 'tree-sitter-java';

export class AstParser 
{
    public parser: Parser;

    constructor() {
        this.parser = new Parser();
        this.parser.setLanguage(Java);
    }

    public parse(sourceCode: string): any 
    {
        return this.parser.parse(sourceCode).rootNode;
    }
}