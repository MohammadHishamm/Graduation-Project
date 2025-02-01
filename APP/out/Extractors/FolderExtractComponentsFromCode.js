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
const vscode = __importStar(require("vscode"));
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_java_1 = __importDefault(require("tree-sitter-java"));
const FileCacheManager_1 = require("../Cache/FileCacheManager");
const CompositeExtractor_1 = require("./CompositeExtractor");
class FolderExtractComponentsFromCode {
    parser;
    cacheManager;
    Files; // Ensure it's always an array
    constructor() {
        this.parser = new tree_sitter_1.default();
        this.parser.setLanguage(tree_sitter_java_1.default);
        this.cacheManager = new FileCacheManager_1.FileCacheManager();
        this.Files = []; // Initialize as an empty array
    }
    async startbolbol(rootNode, fileUri) {
        if (!this.Files.includes(fileUri.path)) {
            // Save files
            this.Files.push(fileUri.path);
        }
        // Extract components and parse Java files
        await this.ExtractComponents(rootNode, fileUri);
        await this.parseAllJavaFiles(); // Make sure to await this if it's an async function
    }
    async ExtractComponents(rootNode, fileUri) {
        const extendedClass = this.IsRelationFound(rootNode);
        if (extendedClass) {
            const importPaths = this.ExtractImportsAndPackage(rootNode);
            // If import paths are found
            if (importPaths.length > 0) {
                const filesToExtract = this.GetFilesToExtract(extendedClass, importPaths);
                if (filesToExtract && filesToExtract.length > 0) {
                    const tree = await this.convertImportToFilePath(filesToExtract);
                    const treeRootNode = tree.rootNode;
                    if (treeRootNode) {
                        await this.ExtractComponents(treeRootNode, fileUri); // Pass the fileUri here
                    }
                }
            }
            else {
                // If no imports are found, check for extended class name matching with files in the same folder
                const javaFiles = await vscode.workspace.findFiles("**/*.java");
                // Get the directory of the current file using fileUri
                const currentFileDirectory = path.dirname(fileUri.fsPath); // Use fsPath from fileUri
                // Find files in the same directory
                const filesInSameFolder = javaFiles.filter(file => path.dirname(file.fsPath) === currentFileDirectory);
                // Check if any of the files in the same folder match the extended class name
                const matchingFile = filesInSameFolder.find(file => path.basename(file.fsPath, ".java") === extendedClass);
                if (matchingFile) {
                    // If a matching file is found, process it
                    const finalFilePath = matchingFile.fsPath;
                    if (!this.Files.includes(finalFilePath)) {
                        this.Files.push(finalFilePath);
                    }
                    const tree = await this.convertextendedToFilePath(finalFilePath);
                    const treeRootNode = tree.rootNode;
                    if (treeRootNode) {
                        await this.ExtractComponents(treeRootNode, fileUri); // Recursively process
                    }
                }
            }
        }
    }
    IsRelationFound(rootNode) {
        let extendedClasses = "";
        const traverse = (currentNode) => {
            if (currentNode.type === "superclass" || currentNode.type === "super_interfaces") {
                extendedClasses = currentNode.text.trim().replace(/^(extends|implements)\s*/, "");
            }
            for (const child of currentNode.children) {
                traverse(child);
            }
        };
        traverse(rootNode);
        return extendedClasses; // Return comma-separated string
    }
    // Extract all the imports from the current file then sends it to the files that need to be extracted
    ExtractImportsAndPackage(rootNode) {
        const importPaths = [];
        const traverse = (currentNode) => {
            if (currentNode.type === "import_declaration") {
                importPaths.push(currentNode.text);
            }
            for (const child of currentNode.children) {
                traverse(child);
            }
        };
        traverse(rootNode);
        return importPaths;
    }
    ExtractClassNameFromImport(importPath) {
        return importPath.replace(";", "").split(".").pop() || "";
    }
    GetFilesToExtract(extendedClass, importPaths) {
        let imports = "";
        importPaths.forEach((importPath) => {
            const ClassNameFromImport = this.ExtractClassNameFromImport(importPath);
            if (ClassNameFromImport === extendedClass) {
                imports = importPath;
            }
        });
        return imports;
    }
    async parseAllJavaFiles() {
        if (!this.Files || this.Files.length === 0) {
            console.log("No files found in this.Files");
            return;
        }
        const existingComponents = this.getParsedComponentsFromFile();
        const allParsedComponents = [...existingComponents];
        console.log("\nCache and file service started...");
        console.log(this.Files);
        for (const filePath of this.Files) {
            const fileUri = vscode.Uri.file(filePath);
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
                    if (existingIndex === -1) {
                        // Only add new components if not already in the list
                        allParsedComponents.push(parsedComponents);
                        this.cacheManager.set(filePath, fileHash, parsedComponents);
                        console.log("Changes detected. New Components saved.");
                        console.log(`Cache updated: ${filePath}`);
                    }
                    else {
                        console.log(`Skipping duplicate file: ${filePath}`);
                    }
                }
                else {
                    console.error(`Error parsing file: ${filePath}`);
                }
            }
        }
        // Save the combined parsed components back to the file
        this.Files = [];
        this.saveParsedComponents(allParsedComponents);
        console.log("Cache and file service Stopped\n");
    }
    async clearFileContent() {
        const filePath = path
            .join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json")
            .replace(/out[\\\/]?/, "");
        try {
            fs.writeFileSync(filePath, ""); // Overwrites the file with an empty string
            console.log(`Cleared content of file: ${filePath}`);
            return true; // Return true if successful
        }
        catch (err) {
            console.error(`Failed to clear file content: ${filePath}`, err);
            return false; // Return false if an error occurs
        }
    }
    saveParsedComponents(parsedComponents) {
        try {
            const filePath = path
                .join(__dirname, "..", "src", "Results", "FolderExtractComponentsFromCode.json")
                .replace(/out[\\\/]?/, "");
            // Remove duplicates based on file names
            const uniqueParsedComponents = parsedComponents.filter((component, index, self) => index === self.findIndex((c) => c.classes.some((classGroup) => classGroup.fileName === component.classes[0].fileName)));
            const newContent = JSON.stringify(uniqueParsedComponents, null, 2);
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
    getParsedComponentsFromFile(fileName) {
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
    async convertImportToFilePath(importPath) {
        // Clean up the import path and ensure it's in a consistent format
        const filePath = importPath.replace("import", "").replace(";", "").trim();
        // Get everything after the first dot (.)
        const filePathAfterFirstDot = filePath.includes(".") ? filePath.substring(filePath.indexOf(".") + 1) : filePath;
        // Convert to file path format
        const formattedFilePath = filePathAfterFirstDot.split(".").join(path.sep);
        console.log(formattedFilePath);
        // Search for Java files in the workspace
        const javaFiles = await vscode.workspace.findFiles("**/*.java");
        if (javaFiles.length === 0) {
            throw new Error("No Java files found in the workspace.");
        }
        // Get the root path of the project (Assume the root folder is the directory of the first Java file)
        const projectRoot = path.dirname(javaFiles[0].fsPath);
        // Convert Java file paths to relative paths
        const relativeJavaFiles = javaFiles.map(javaFile => path.relative(projectRoot, javaFile.fsPath));
        // Normalize paths to always use forward slashes for comparison
        const normalizedFilePath = formattedFilePath.replace(/\\/g, "/") + ".java"; // Ensure it ends with .java
        const matchingFile = relativeJavaFiles.find(file => file.replace(/\\/g, "/") === normalizedFilePath);
        // Determine final file path
        const finalFilePath = matchingFile
            ? path.join(projectRoot, matchingFile)
            : path.join(projectRoot, formattedFilePath + ".java");
        // Check if the file exists before reading
        if (!fs.existsSync(finalFilePath)) {
            console.error(`File does not exist at path: ${finalFilePath}`);
            throw new Error(`Could not find file at path: ${finalFilePath}`);
        }
        try {
            const uri = vscode.Uri.file(finalFilePath);
            const fileContent = await vscode.workspace.fs.readFile(uri);
            const fileContentString = new TextDecoder().decode(fileContent);
            if (!this.Files.includes(finalFilePath)) {
                // Save files
                this.Files.push(finalFilePath);
            }
            const parsedComponents = await this.parseFiletest(uri);
            return parsedComponents;
        }
        catch (error) {
            console.error("Error reading file:", error);
            throw new Error(`Could not read file: ${finalFilePath}`);
        }
    }
    async convertextendedToFilePath(finalFilePath) {
        const uri = vscode.Uri.file(finalFilePath);
        // Parse the file
        const parsedComponents = await this.parseFiletest(uri); // Await the result
        // if (parsedComponents) {
        //   allParsedComponents.push(parsedComponents);
        //   this.saveParsedComponents(allParsedComponents);  // Save parsed data
        // }
        return parsedComponents;
    }
    async parseFiletest(fileUri) {
        const fileContent = await this.fetchFileContent(fileUri);
        const tree = this.parseCode(fileContent);
        return tree;
    }
    getParsedComponentsByFileName(fileName) {
        try {
            const parsedComponents = this.getParsedComponentsFromFile();
            const matchingComponent = parsedComponents.find((component) => component.classes.some((classGroup) => classGroup.fileName === fileName));
            if (!matchingComponent) {
                console.warn(`No data found for file name: ${fileName}`);
                return null;
            }
            return matchingComponent;
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
            console.error("Error parsing file ${fileUri.fsPath}:, error");
            return null;
        }
    }
    extractFileComponents(tree, fileName) {
        const rootNode = tree.rootNode;
        const compositeextractor = new CompositeExtractor_1.CompositeExtractor();
        const classgroup = compositeextractor.extractClassGroup(rootNode, fileName);
        return {
            classes: classgroup,
        };
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