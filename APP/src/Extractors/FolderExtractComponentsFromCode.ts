import * as vscode from 'vscode';
import Parser from 'tree-sitter';
import { FileParsedComponents, ClassGroup } from '../Interface/FileParsedComponents'; // Import the correct interface
import { ExtractComponentsFromCode } from './ExtractComponentsFromCode'; // Import the correct interface
import java from 'tree-sitter-java';
import * as fs from "fs";
import * as path from "path";

export class FolderExtractComponentsFromCode {
    public parser: Parser;

    constructor() 
    {
        this.parser = new Parser();
        this.parser.setLanguage(java); // Use Java grammar
    }

    public async parseAllJavaFiles() {
        // Step 1: Find all Java files in the workspace
        const javaFiles = await vscode.workspace.findFiles('**/*.java');

        // Step 2: Initialize an array to store the parsed components
        let allParsedComponents: FileParsedComponents[] = [];

        // Step 3: Loop through each file and parse it
        for (const fileUri of javaFiles) {
            const parsedComponents = await this.parseFile(fileUri);

            // If components are parsed, add them to the allParsedComponents array
            if (parsedComponents) {
                allParsedComponents.push(parsedComponents); // Append to array
            } else {
                console.error(`Error parsing file: ${fileUri.fsPath}`);
            }
        }

        try {
            let filePath = path.join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json");

            // Remove 'out' from the file path, if it exists
            filePath = filePath.replace(/out[\\\/]?/, "");

            fs.writeFileSync(filePath, JSON.stringify(allParsedComponents, null, 2));
            console.log("Metrics saved to Metrics.json.");
        } catch (err) {
            console.log("Failed to save metrics to file.");
            console.error(err);
        }

    }


    public getParsedComponentsFromFile(): FileParsedComponents[] {
        try {
            const filePath = path.join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json");

            // Remove 'out' from the file path, if it exists
            const adjustedPath = filePath.replace(/out[\\\/]?/, "");

            // Read the file content
            const fileContent = fs.readFileSync(adjustedPath, 'utf8');

            // Parse the JSON content and return it
            return JSON.parse(fileContent) as FileParsedComponents[];
        } catch (err) {
            console.error("Failed to read parsed components from file:", err);
            return [];
        }
    }

    public async parseFile(fileUri: vscode.Uri): Promise<FileParsedComponents | null> {
        try {
            // Step 1: Fetch the content of the file using VS Code API
            const fileContent = await this.fetchFileContent(fileUri);

            // Step 2: Parse the content of the file
            const tree = this.parseCode(fileContent);

            // Step 3: Extract components (classes, methods, fields) from the parsed code
            return this.extractComponents(tree, fileUri.fsPath);
        } catch (error) {
            console.error(`Error parsing file ${fileUri.fsPath}:`, error);
            return null;
        }
    }

    private async fetchFileContent(fileUri: vscode.Uri): Promise<string> {
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        return Buffer.from(fileContent).toString('utf8');
    }

    public parseCode(sourceCode: string): Parser.Tree {
        return this.parser.parse(sourceCode); // Parse Java source code
    }


    public extractComponents(tree: Parser.Tree, fileName: string): FileParsedComponents {
        const rootNode = tree.rootNode;

        const classgroup = this.extractClasses(rootNode, fileName);

        return {
            classes: classgroup  // Return the object with the 'classes' property
        };
    }

    public extractClasses(rootNode: Parser.SyntaxNode, fileName: string): ClassGroup[] {
        const classNodes = rootNode.descendantsOfType('class_declaration');


        const extractcomponentsfromcode = new ExtractComponentsFromCode();
        const classes = extractcomponentsfromcode.extractClasses(rootNode);
        const methods = extractcomponentsfromcode.extractMethods(rootNode, classes);
        const fields = extractcomponentsfromcode.extractFields(rootNode, classes);


        return classNodes.map((node) => ({
            fileName: fileName,
            name: node.childForFieldName('name')?.text ?? 'Unknown',
            methods: methods,
            fields: fields,
        }));
    }
}
