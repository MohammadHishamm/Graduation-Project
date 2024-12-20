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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_java_1 = __importDefault(require("tree-sitter-java"));
const FileExtractComponentsFromCode_1 = require("./FileExtractComponentsFromCode");
const FileCacheManager_1 = require("../Cache/FileCacheManager");
class FolderExtractComponentsFromCode {
    parser;
    cacheManager;
    constructor() {
        this.parser = new tree_sitter_1.default();
        this.parser.setLanguage(tree_sitter_java_1.default);
        this.cacheManager = new FileCacheManager_1.FileCacheManager();
    }
    async parseAllJavaFiles() {
        const javaFiles = await vscode.workspace.findFiles("**/*.java");
        const allParsedComponents = [];
        for (const fileUri of javaFiles) {
            const filePath = fileUri.fsPath;
            const fileContent = await this.fetchFileContent(fileUri);
            const fileHash = FileCacheManager_1.FileCacheManager.computeHash(fileContent);
            const cachedComponents = this.cacheManager.get(filePath, fileHash);
            if (cachedComponents) {
                console.log(`Cache hit: ${filePath}`);
            }
            else {
                const parsedComponents = await this.parseFile(fileUri);
                if (parsedComponents) {
                    allParsedComponents.push(parsedComponents);
                    this.cacheManager.set(filePath, fileHash, parsedComponents);
                    this.saveParsedComponents(allParsedComponents);
                    console.log("changes detected , New Metrics saved");
                    console.log(`Cache updated: ${filePath}`);
                }
                else {
                    console.error(`Error parsing file: ${filePath}`);
                }
            }
        }
    }
    saveParsedComponents(parsedComponents) {
        try {
            const filePath = path
                .join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json")
                .replace(/out[\\\/]?/, "");
            const newContent = JSON.stringify(parsedComponents, null, 2);
            if (newContent) {
                fs.writeFileSync(filePath, newContent);
            }
            else {
                console.log("No parsedComponents.");
            }
        }
        catch (err) {
            console.error("Failed to save parsedComponents to file:", err);
        }
    }
    getParsedComponentsFromFile() {
        try {
            const filePath = path.join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json");
            const adjustedPath = filePath.replace(/out[\\\/]?/, "");
            const fileContent = fs.readFileSync(adjustedPath, "utf8");
            return JSON.parse(fileContent);
        }
        catch (err) {
            console.error("Failed to read parsed components from file:", err);
            return [];
        }
    }
    async parseFile(fileUri) {
        try {
            const fileContent = await this.fetchFileContent(fileUri);
            const tree = this.parseCode(fileContent);
            return this.extractComponents(tree, fileUri.fsPath);
        }
        catch (error) {
            console.error("Error parsing file ${fileUri.fsPath}:, error");
            return null;
        }
    }
    async fetchFileContent(fileUri) {
        const fileContent = await vscode.workspace.fs.readFile(fileUri);
        return Buffer.from(fileContent).toString("utf8");
    }
    parseCode(sourceCode) {
        return this.parser.parse(sourceCode);
    }
    extractComponents(tree, fileName) {
        const rootNode = tree.rootNode;
        const classgroup = this.extractClasses(rootNode, fileName);
        return {
            classes: classgroup,
        };
    }
    extractClasses(rootNode, fileName) {
        const classNodes = rootNode.descendantsOfType("class_declaration");
        const extractcomponentsfromcode = new FileExtractComponentsFromCode_1.FileExtractComponentsFromCode();
        const classes = extractcomponentsfromcode.extractClasses(rootNode);
        const methods = extractcomponentsfromcode.extractMethods(rootNode, classes);
        const fields = extractcomponentsfromcode.extractFields(rootNode, classes);
        return classNodes.map((node) => ({
            fileName: fileName,
            name: node.childForFieldName("name")?.text ?? "Unknown",
            methods: methods,
            fields: fields,
        }));
    }
}
exports.FolderExtractComponentsFromCode = FolderExtractComponentsFromCode;
//# sourceMappingURL=FolderExtractComponentsFromCode.js.map