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
const tree_sitter_java_1 = __importDefault(require("tree-sitter-java"));
class FolderExtractComponentsFromCode {
    parser;
    constructor() {
        this.parser = new tree_sitter_1.default();
        this.parser.setLanguage(tree_sitter_java_1.default); // Use Java grammar
    }
    /**
     * This function will fetch all Java files in the workspace and parse them.
     */
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
        // Return the array of parsed components
        return allParsedComponents;
    }
    /**
     * This function will be responsible for fetching and parsing the code from the file.
     * @param fileUri - URI of the file to fetch the content from
     */
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
    /**
     * Fetch the content of a file given its URI.
     * @param fileUri - URI of the file
     * @returns The content of the file as a string
     */
    async fetchFileContent(fileUri) {
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        return Buffer.from(fileContent).toString('utf8');
    }
    /**
     * Parse the source code string to create a syntax tree.
     * @param sourceCode - The source code as a string
     * @returns A parsed tree of the code
     */
    parseCode(sourceCode) {
        return this.parser.parse(sourceCode); // Parse Java source code
    }
    /**
     * Extract components (classes, methods, fields) from the parsed syntax tree.
     * @param tree - The parsed syntax tree
     * @param fileName - The file name for tracking purposes
     * @returns The parsed components: classes, methods, fields
     */
    extractComponents(tree, fileName) {
        const rootNode = tree.rootNode;
        const classgroup = this.extractClasses(rootNode, fileName);
        return {
            classes: classgroup // Return the object with the 'classes' property
        };
    }
    extractClassesinfo(rootNode) {
        const classNodes = rootNode.descendantsOfType('class_declaration');
        return classNodes.map((node) => ({
            fileName: rootNode.text, // Assuming you want to track the file name for each class
            name: node.childForFieldName('name')?.text ?? 'Unknown',
            startPosition: node.startPosition,
            endPosition: node.endPosition,
        }));
    }
    extractClasses(rootNode, fileName) {
        const classNodes = rootNode.descendantsOfType('class_declaration');
        const classes = this.extractClassesinfo(rootNode);
        const methods = this.extractMethods(rootNode, classes);
        const fields = this.extractFields(rootNode, classes);
        return classNodes.map((node) => ({
            fileName: fileName,
            name: node.childForFieldName('name')?.text ?? 'Unknown',
            methods: methods,
            fields: fields,
        }));
    }
    extractMethods(rootNode, classes) {
        const methodNodes = rootNode.descendantsOfType('method_declaration');
        return methodNodes.map((node) => {
            const modifiersNode = node.children.find((child) => child.type === 'modifiers');
            const modifiers = modifiersNode ? modifiersNode.text : '';
            const isOverridden = modifiers.includes('@Override');
            let accessModifier = modifiers.replace('@Override', '').replace('static', '').trim();
            if (accessModifier.includes('public')) {
                accessModifier = 'public';
            }
            else if (accessModifier.includes('private')) {
                accessModifier = 'private';
            }
            else if (accessModifier.includes('protected')) {
                accessModifier = 'protected';
            }
            else {
                accessModifier = 'public'; // Default to public if no access modifier is found
            }
            const name = node.childForFieldName('name')?.text ?? 'Unknown';
            const params = node.childForFieldName('parameters')?.text ?? '';
            const parentClass = this.findParentClass(node, classes);
            const isConstructor = parentClass ? parentClass.name === name : false;
            const isAccessor = this.isAccessor(name);
            return {
                name,
                modifiers: accessModifier, // Only 'public', 'private', or 'protected' are kept
                isConstructor,
                isAccessor,
                isOverridden, // Add the isOverridden field to the return value
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }
    extractFields(rootNode, classes) {
        const fieldNodes = rootNode.descendantsOfType('field_declaration');
        return fieldNodes.map((node) => {
            const modifiersNode = node.child(0);
            const modifiers = modifiersNode ? modifiersNode.text : '';
            const typeNode = node.child(1);
            const type = typeNode ? typeNode.text : '';
            const nameNode = node.child(2);
            const name = nameNode ? nameNode.text : 'Unknown';
            return {
                name,
                type,
                modifiers,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }
    findParentClass(node, classes) {
        for (const cls of classes) {
            if (node.startPosition.row >= cls.startPosition.row &&
                node.endPosition.row <= cls.endPosition.row) {
                return cls;
            }
        }
        return null;
    }
    isAccessor(methodName) {
        const isGetter = /^get[A-Za-z]/.test(methodName);
        const isSetter = /^set[A-Za-z]/.test(methodName);
        return isGetter || isSetter;
    }
}
exports.FolderExtractComponentsFromCode = FolderExtractComponentsFromCode;
//# sourceMappingURL=FECFCode.js.map