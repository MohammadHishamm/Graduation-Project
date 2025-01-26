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
        // Load existing parsed components from the file
        const existingComponents = this.getParsedComponentsFromFile();
        const allParsedComponents = [...existingComponents];
        console.log("Cache and file service started: ");
        console.log("..................................................................................................");
        console.log("Existing Parsed Components: ", existingComponents);
        for (const fileUri of javaFiles) {
            const filePath = fileUri.fsPath;
            const fileContent = await this.fetchFileContent(fileUri);
            const fileHash = FileCacheManager_1.FileCacheManager.computeHash(fileContent);
            // Check cache to see if the file has been processed before
            const cachedComponents = this.cacheManager.get(filePath, fileHash);
            if (cachedComponents) {
                console.log(`Cache hit: ${filePath}`);
            }
            else {
                const parsedComponents = await this.parseFile(fileUri);
                if (parsedComponents) {
                    // Check if the file is already in the parsed components list
                    const existingIndex = allParsedComponents.findIndex((component) => component.classes.some((classGroup) => classGroup.fileName === filePath));
                    if (existingIndex !== -1) {
                        // Update the existing parsed component
                        allParsedComponents[existingIndex] = parsedComponents;
                    }
                    else {
                        // Add the new parsed component
                        allParsedComponents.push(parsedComponents);
                    }
                    // Update the cache
                    this.cacheManager.set(filePath, fileHash, parsedComponents);
                    console.log("Changes detected. New metrics saved.");
                    console.log(`Cache updated: ${filePath}`);
                }
                else {
                    console.error(`Error parsing file: ${filePath}`);
                }
            }
        }
        // Save the combined parsed components back to the file
        this.saveParsedComponents(allParsedComponents);
        console.log("Stopped");
        console.log("..................................................................................................");
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
            // Check if the file content is empty or only contains whitespace
            if (!fileContent.trim()) {
                console.warn("The file is empty or contains only whitespace.");
                return [];
            }
            // Try to parse the content, handle potential JSON parsing errors
            try {
                return JSON.parse(fileContent);
            }
            catch (parseError) {
                console.error("Failed to parse JSON from file:", parseError);
                return [];
            }
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
            const extractcomponentsfromcode = new FileExtractComponentsFromCode_1.FileExtractComponentsFromCode();
            return extractcomponentsfromcode.extractFileComponents(tree, fileUri.fsPath);
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
}
exports.FolderExtractComponentsFromCode = FolderExtractComponentsFromCode;
//# sourceMappingURL=FolderExtractComponentsFromCode.js.map