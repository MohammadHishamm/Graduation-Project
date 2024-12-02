
import Parser from 'tree-sitter';



export abstract class ASTParser 
{
    public parser: Parser;

    constructor() {
        this.parser = new Parser();
    }
  
    abstract selectLanguage():any;
        
    

    public parse(sourceCode: string): any 
    {
        return this.parser.parse(sourceCode).rootNode; // Parse Python source code
        
    }
}
