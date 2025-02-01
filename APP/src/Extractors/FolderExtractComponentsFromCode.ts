import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import Parser from "tree-sitter";
import java from "tree-sitter-java";

import { FileCacheManager } from "../Cache/FileCacheManager";
import { FileParsedComponents } from "../Interface/FileParsedComponents";
import { CompositeExtractor } from "./CompositeExtractor";
export class FolderExtractComponentsFromCode {
  private parser: Parser;
  private cacheManager: FileCacheManager;
  private Files: string[]; // Ensure it's always an array

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(java);
    this.cacheManager = new FileCacheManager();
    this.Files = []; // Initialize as an empty array
  }

  public async startbolbol(rootNode: Parser.SyntaxNode, fileUri: vscode.Uri) {
    if (!this.Files.includes(fileUri.path)) {
      // Save files
      this.Files.push(fileUri.path);
    }

    // Extract components and parse Java files
    await this.ExtractComponents(rootNode, fileUri);
    await this.parseAllJavaFiles(); // Make sure to await this if it's an async function
  }

  public async ExtractComponents(
    rootNode: Parser.SyntaxNode,
    fileUri: vscode.Uri
  ) {
    const extendedClass = this.IsRelationFound(rootNode);

    if (extendedClass) {
      const importPaths = this.ExtractImportsAndPackage(rootNode);

      // If import paths are found
      if (importPaths.length > 0) {
        const filesToExtract = this.GetFilesToExtract(
          extendedClass,
          importPaths
        );

        if (filesToExtract && filesToExtract.length > 0) {
          const tree = await this.convertImportToFilePath(filesToExtract);
          const treeRootNode = tree.rootNode;

          if (treeRootNode) {
            await this.ExtractComponents(treeRootNode, fileUri); // Pass the fileUri here
          }
        }
      } else {
        // If no imports are found, check for extended class name matching with files in the same folder
        const javaFiles = await vscode.workspace.findFiles("**/*.java");

        // Get the directory of the current file using fileUri
        const currentFileDirectory = path.dirname(fileUri.fsPath); // Use fsPath from fileUri

        // Find files in the same directory
        const filesInSameFolder = javaFiles.filter(
          (file) => path.dirname(file.fsPath) === currentFileDirectory
        );

        // Check if any of the files in the same folder match the extended class name
        const matchingFile = filesInSameFolder.find(
          (file) => path.basename(file.fsPath, ".java") === extendedClass
        );

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

  public IsRelationFound(rootNode: Parser.SyntaxNode): string | null {
    let extendedClasses = "";

    const traverse = (currentNode: Parser.SyntaxNode) => {
      if (
        currentNode.type === "superclass" ||
        currentNode.type === "super_interfaces"
      ) {
        extendedClasses = currentNode.text
          .trim()
          .replace(/^(extends|implements)\s*/, "");
      }
      for (const child of currentNode.children) {
        traverse(child);
      }
    };

    traverse(rootNode);

    return extendedClasses; // Return comma-separated string
  }

  // Extract all the imports from the current file then sends it to the files that need to be extracted
  public ExtractImportsAndPackage(rootNode: Parser.SyntaxNode): string[] {
    const importPaths: string[] = [];

    const traverse = (currentNode: Parser.SyntaxNode) => {
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

  public ExtractClassNameFromImport(importPath: string): string {
    return importPath.replace(";", "").split(".").pop() || "";
  }

  public GetFilesToExtract(
    extendedClass: string,
    importPaths: string[]
  ): string {
    let imports = "";
    importPaths.forEach((importPath) => {
      const ClassNameFromImport = this.ExtractClassNameFromImport(importPath);

      if (ClassNameFromImport === extendedClass) {
        imports = importPath;
      }
    });

    return imports;
  }

  public async parseAllJavaFiles() {
    if (!this.Files || this.Files.length === 0) {
      console.log("No files found in this.Files");
      return;
    }

    const existingComponents = this.getParsedComponentsFromFile();
    const allParsedComponents: FileParsedComponents[] = [...existingComponents];

    console.log("\nCache and file service started...");
    console.log(this.Files);

    for (const filePath of this.Files) {
      const fileUri = vscode.Uri.file(filePath);
      const fileContent = await this.fetchFileContent(fileUri);
      const fileHash = FileCacheManager.computeHash(fileContent);

      // Check cache to see if the file has been processed before
      const cachedComponents = this.cacheManager.get(filePath, fileHash);

      if (cachedComponents) {
        console.log(`Cache hit: ${filePath}`);
      } else {
        const parsedComponents = await this.parseFile(fileUri);
        if (parsedComponents) {
          // Check if the file is already in the parsed components list
          const existingIndex = allParsedComponents.findIndex((component) =>
            component.classes.some(
              (classGroup) => classGroup.fileName === filePath
            )
          );

          if (existingIndex === -1) {
            // Only add new components if not already in the list
            allParsedComponents.push(parsedComponents);
            this.cacheManager.set(filePath, fileHash, parsedComponents);

            console.log("Changes detected. New Components saved.");
            console.log(`Cache updated: ${filePath}`);
          } else {
            console.log(`Skipping duplicate file: ${filePath}`);
          }
        } else {
          console.error(`Error parsing file: ${filePath}`);
        }
      }
    }

    // Save the combined parsed components back to the file
    this.Files = [];
    this.saveParsedComponents(allParsedComponents);
    console.log("Cache and file service Stopped\n");
  }

  private async clearFileContent(): Promise<boolean> {
    const filePath = path
      .join(
        __dirname,
        "..",
        "src",
        "Results",
        "FolderExtractComponentsFromCode.json"
      )
      .replace(/out[\\\/]?/, "");

    try {
      fs.writeFileSync(filePath, ""); // Overwrites the file with an empty string
      console.log(`Cleared content of file: ${filePath}`);
      return true; // Return true if successful
    } catch (err) {
      console.error(`Failed to clear file content: ${filePath}`, err);
      return false; // Return false if an error occurs
    }
  }

  private saveParsedComponents(parsedComponents: FileParsedComponents[]) {
    try {
      const filePath = path
        .join(
          __dirname,
          "..",
          "src",
          "Results",
          "FolderExtractComponentsFromCode.json"
        )
        .replace(/out[\\\/]?/, "");

      // Remove duplicates based on file names
      const uniqueParsedComponents = parsedComponents.filter(
        (component, index, self) =>
          index ===
          self.findIndex((c) =>
            c.classes.some(
              (classGroup) =>
                classGroup.fileName === component.classes[0].fileName
            )
          )
      );

      const newContent = JSON.stringify(uniqueParsedComponents, null, 2);
      if (newContent) {
        fs.writeFileSync(filePath, newContent);
      } else {
        console.log("No parsedComponents.");
      }
    } catch (err) {
      console.error("Failed to save parsedComponents to file:", err);
    }
  }

  public getParsedComponentsFromFile(
    fileName?: string
  ): FileParsedComponents[] {
    try {
      const filePath = path.join(
        __dirname,
        "..",
        "src",
        "Results",
        "FolderExtractComponentsFromCode.json"
      );

      const adjustedPath = filePath.replace(/out[\\\/]?/, "");

      const fileContent = fs.readFileSync(adjustedPath, "utf8");

      // Check if the file content is empty or only contains whitespace
      if (!fileContent.trim()) {
        console.warn("The file is empty or contains only whitespace.");
        return [];
      }

      // Try to parse the content, handle potential JSON parsing errors
      try {
        return JSON.parse(fileContent) as FileParsedComponents[];
      } catch (parseError) {
        console.error("Failed to parse JSON from file:", parseError);
        return [];
      }
    } catch (err) {
      console.error("Failed to read parsed components from file:", err);
      return [];
    }
  }

  public async convertImportToFilePath(
    importPath: string
  ): Promise<Parser.Tree> {
    // Clean up the import path and ensure it's in a consistent format
    const filePath = importPath.replace("import", "").replace(";", "").trim();

    // Get everything after the first dot (.)
    const filePathAfterFirstDot = filePath.includes(".")
      ? filePath.substring(filePath.indexOf(".") + 1)
      : filePath;

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
    const relativeJavaFiles = javaFiles.map((javaFile) =>
      path.relative(projectRoot, javaFile.fsPath)
    );

    // Normalize paths to always use forward slashes for comparison
    const normalizedFilePath = formattedFilePath.replace(/\\/g, "/") + ".java"; // Ensure it ends with .java
    const matchingFile = relativeJavaFiles.find(
      (file) => file.replace(/\\/g, "/") === normalizedFilePath
    );

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
    } catch (error) {
      console.error("Error reading file:", error);
      throw new Error(`Could not read file: ${finalFilePath}`);
    }
  }

  public async convertextendedToFilePath(
    finalFilePath: string
  ): Promise<Parser.Tree> {
    const uri = vscode.Uri.file(finalFilePath);

    // Parse the file
    const parsedComponents = await this.parseFiletest(uri); // Await the result

    // if (parsedComponents) {
    //   allParsedComponents.push(parsedComponents);
    //   this.saveParsedComponents(allParsedComponents);  // Save parsed data
    // }

    return parsedComponents;
  }

  public async parseFiletest(fileUri: vscode.Uri): Promise<Parser.Tree> {
    const fileContent = await this.fetchFileContent(fileUri);

    const tree = this.parseCode(fileContent);

    return tree;
  }

  public getParsedComponentsByFileName(
    fileName: string
  ): FileParsedComponents | null {
    try {
      const parsedComponents = this.getParsedComponentsFromFile();

      const matchingComponent = parsedComponents.find((component) =>
        component.classes.some((classGroup) => classGroup.fileName === fileName)
      );

      if (!matchingComponent) {
        console.warn(`No data found for file name: ${fileName}`);
        return null;
      }

      return matchingComponent;
    } catch (err) {
      console.error(
        `Failed to get parsed components for file: ${fileName}`,
        err
      );
      return null;
    }
  }

  public async parseFile(
    fileUri: vscode.Uri
  ): Promise<FileParsedComponents | null> {
    try {
      const fileContent = await this.fetchFileContent(fileUri);

      const tree = this.parseCode(fileContent);

      return this.extractFileComponents(tree, fileUri.fsPath);
    } catch (error) {
      console.error("Error parsing file ${fileUri.fsPath}:, error");
      return null;
    }
  }

  public extractFileComponents(
    tree: Parser.Tree,
    fileName: string
  ): FileParsedComponents {
    const rootNode = tree.rootNode;

    const compositeextractor = new CompositeExtractor();

    const classgroup = compositeextractor.extractClassGroup(rootNode, fileName);

    return {
      classes: classgroup,
    };
  }

  private async fetchFileContent(fileUri: vscode.Uri): Promise<string> {
    const fileContent = await vscode.workspace.fs.readFile(fileUri);
    return Buffer.from(fileContent).toString("utf8");
  }

  public parseCode(sourceCode: string): Parser.Tree {
    return this.parser.parse(sourceCode);
  }
}
