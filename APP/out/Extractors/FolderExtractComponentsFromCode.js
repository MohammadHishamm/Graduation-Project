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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderExtractComponentsFromCode = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_java_1 = __importDefault(require("tree-sitter-java"));
const vscode = __importStar(require("vscode"));
const FileCacheManager_1 = require("../Cache/FileCacheManager");
const CompositeExtractor_1 = require("./CompositeExtractor");
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
        const existingComponents = this.getParsedComponentsFromFile();
        const allParsedComponents = [...existingComponents];
        console.log("Cache and file service started...");
        console.log("Existing Parsed Components:", existingComponents);
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
                    const existingIndex = allParsedComponents.findIndex((component) => component.classes.some((classGroup) => classGroup.fileName === filePath));
                    if (existingIndex !== -1) {
                        allParsedComponents[existingIndex] = parsedComponents;
                    }
                    else {
                        allParsedComponents.push(parsedComponents);
                    }
                    this.cacheManager.set(filePath, fileHash, parsedComponents);
                    console.log(`Changes detected and cache updated: ${filePath}`);
                }
                else {
                    console.error(`Error parsing file: ${filePath}`);
                }
            }
        }
        this.saveParsedComponents(allParsedComponents);
        console.log("Cache and file service stopped.");
    }
    saveParsedComponents(parsedComponents) {
        try {
            parsedComponents.forEach((component) => {
                const fileName = component.classes[0]?.fileName || 'UnknownFile';
                const baseName = path.basename(fileName, path.extname(fileName)); // Get the base name (without extension)
                // Ensure the file is saved with a name matching the baseName for easy retrieval
                const filePath = path.join(__dirname, "..", "src", "ExtractedFileComponents", `${baseName}.json`).replace(/out[\\\/]?/, "");
                const newContent = JSON.stringify(component, null, 2);
                fs.writeFileSync(filePath, newContent);
                console.log(`Saved parsed component for file: ${baseName}`);
            });
        }
        catch (err) {
            console.error("Failed to save parsed components to files:", err);
        }
    }
    deleteAllResultsFiles() {
        try {
            const resultsDir = path.join(__dirname, "..", "src", "ExtractedFileComponents");
            // Check if the Results directory exists
            if (fs.existsSync(resultsDir)) {
                // Get all files in the Results directory
                const files = fs.readdirSync(resultsDir);
                // Loop through the files and delete each one
                files.forEach((file) => {
                    const filePath = path.join(resultsDir, file);
                    if (fs.lstatSync(filePath).isFile()) {
                        fs.unlinkSync(filePath); // Delete the file
                        console.log(`Deleted file: ${file}`);
                    }
                });
                console.log("All files deleted from the Results folder.");
            }
            else {
                console.warn("Results folder does not exist.");
            }
        }
        catch (err) {
            console.error("Failed to delete files from the Results folder:", err);
        }
    }
    getParsedComponentsFromFile() {
        try {
            const filePath = path.join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json").replace(/out[\\\/]?/, "");
            const fileContent = fs.readFileSync(filePath, "utf8");
            return fileContent.trim() ? JSON.parse(fileContent) : [];
        }
        catch (err) {
            console.error("Failed to read parsed components from file:", err);
            return [];
        }
    }
    getParsedComponentsByFileName(fileName) {
        try {
            let resultsDir = path.join(__dirname, "..", "ExtractedFileComponents");
            resultsDir = resultsDir.replace('out', 'src');
            const files = fs.readdirSync(resultsDir); // Read all files in the Results folder
            let parsedComponents;
            // Loop through the files, read their content, and parse it
            for (const file of files) {
                const filePath = path.join(resultsDir, file);
                if (path.basename(fileName, path.extname(fileName)) === path.basename(filePath, path.extname(filePath))) {
                    const fileContent = fs.readFileSync(filePath, "utf8");
                    const parsedComponent = JSON.parse(fileContent);
                    parsedComponents = parsedComponent;
                }
            }
            const matchingComponent = parsedComponents;
            if (!matchingComponent) {
                console.warn(`No data found for file name: ${fileName}`);
                return null;
            }
            return matchingComponent; // Return the matching component
        }
        catch (err) {
            console.error(`Failed to get parsed components for file: ${fileName}`, err);
            return null;
        }
    }
    async parseFile(fileUri) {
        try {
            const fileContent = await this.fetchFileContent(fileUri);
            const tree = this.parseCode(fileContent);
            return this.extractFileComponents(tree, fileUri.fsPath);
        }
        catch (error) {
            console.error(`Error parsing file ${fileUri.fsPath}:`, error);
            return null;
        }
    }
    extractFileComponents(tree, fileName) {
        const compositeExtractor = new CompositeExtractor_1.CompositeExtractor();
        const classGroup = compositeExtractor.extractClassGroup(tree.rootNode, fileName);
        return { classes: classGroup };
    }
    // ✅ Buffered Reading Using Streams and Chunks
    async fetchFileContent(fileUri) {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(fileUri.fsPath, { encoding: "utf8", highWaterMark: 64 * 1024 }); // 64KB chunks
            let fileContent = "";
            stream.on("data", (chunk) => {
                fileContent += chunk;
            });
            stream.on("end", () => {
                resolve(fileContent);
            });
            stream.on("error", (err) => {
                console.error(`Error reading file: ${fileUri.fsPath}`, err);
                reject(err);
            });
        });
    }
    parseCode(sourceCode) {
        return this.parser.parse(sourceCode);
    }
}
exports.FolderExtractComponentsFromCode = FolderExtractComponentsFromCode;
//# sourceMappingURL=FolderExtractComponentsFromCode.js.map