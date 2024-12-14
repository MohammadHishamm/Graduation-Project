"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderExtractComponentsFromCode = void 0;
const vscode = __importStar(require("vscode"));
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const ExtractComponentsFromCode_1 = require("./ExtractComponentsFromCode"); // Import the correct interface
const tree_sitter_java_1 = __importDefault(require("tree-sitter-java"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class FolderExtractComponentsFromCode {
    parser;
    constructor() {
        this.parser = new tree_sitter_1.default();
        this.parser.setLanguage(tree_sitter_java_1.default); // Use Java grammar
    }
    async parseAllJavaFiles() {
        // Step 1: Find all Java files in the workspace
        const javaFiles = await vscode.workspace.findFiles('**/*.java');
        // Step 2: Initialize an array to store the parsed components
        let allParsedComponents = [];
        // Step 3: Loop through each file and parse it
        for (const fileUri of javaFiles) {
            const parsedComponents = await this.parseFile(fileUri);
            // If components are parsed, add them to the allParsedComponents array
            if (parsedComponents) {
                allParsedComponents.push(parsedComponents); // Append to array
            }
            else {
                console.error(`Error parsing file: ${fileUri.fsPath}`);
            }
        }
        try {
            let filePath = path.join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json");
            // Remove 'out' from the file path, if it exists
            filePath = filePath.replace(/out[\\\/]?/, "");
            fs.writeFileSync(filePath, JSON.stringify(allParsedComponents, null, 2));
            console.log("Metrics saved to Metrics.json.");
        }
        catch (err) {
            console.log("Failed to save metrics to file.");
            console.error(err);
        }
    }
    getParsedComponentsFromFile() {
        try {
            const filePath = path.join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json");
            // Remove 'out' from the file path, if it exists
            const adjustedPath = filePath.replace(/out[\\\/]?/, "");
            // Read the file content
            const fileContent = fs.readFileSync(adjustedPath, 'utf8');
            // Parse the JSON content and return it
            return JSON.parse(fileContent);
        }
        catch (err) {
            console.error("Failed to read parsed components from file:", err);
            return [];
        }
    }
    async parseFile(fileUri) {
        try {
            // Step 1: Fetch the content of the file using VS Code API
            const fileContent = await this.fetchFileContent(fileUri);
            // Step 2: Parse the content of the file
            const tree = this.parseCode(fileContent);
            // Step 3: Extract components (classes, methods, fields) from the parsed code
            return this.extractComponents(tree, fileUri.fsPath);
        }
        catch (error) {
            console.error(`Error parsing file ${fileUri.fsPath}:`, error);
            return null;
        }
    }
    async fetchFileContent(fileUri) {
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        return Buffer.from(fileContent).toString('utf8');
    }
    parseCode(sourceCode) {
        return this.parser.parse(sourceCode); // Parse Java source code
    }
    extractComponents(tree, fileName) {
        const rootNode = tree.rootNode;
        const classgroup = this.extractClasses(rootNode, fileName);
        return {
            classes: classgroup // Return the object with the 'classes' property
        };
    }
    extractClasses(rootNode, fileName) {
        const classNodes = rootNode.descendantsOfType('class_declaration');
        const extractcomponentsfromcode = new ExtractComponentsFromCode_1.ExtractComponentsFromCode();
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
exports.FolderExtractComponentsFromCode = FolderExtractComponentsFromCode;
//# sourceMappingURL=FolderExtractComponentsFromCode.js.map