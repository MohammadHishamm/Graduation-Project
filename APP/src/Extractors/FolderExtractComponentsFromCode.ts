import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import Parser from "tree-sitter";
import java from "tree-sitter-java";

import { FileCacheManager } from "../Cache/FileCacheManager";
import { FileParsedComponents } from "../Interface/FileParsedComponents";
import { CompositeExtractor } from "./CompositeExtractor";

export class FolderExtractComponentsFromCode 
{

  private parser: Parser;
  private cacheManager: FileCacheManager;

  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(java);
    this.cacheManager = new FileCacheManager();
  }

  public async parseAllJavaFiles() {
    const javaFiles = await vscode.workspace.findFiles("**/*.java");

    // Load existing parsed components from the file
    const existingComponents = this.getParsedComponentsFromFile();
    const allParsedComponents: FileParsedComponents[] = [...existingComponents];

    console.log("");
    console.log("Cache and file service started... ");
    for (const fileUri of javaFiles) {
        const filePath = fileUri.fsPath;
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
                component.classes.some((classGroup) => classGroup.fileName === filePath));

               
                if (existingIndex !== -1) 
                {
                    // Update the existing parsed component
                    allParsedComponents[existingIndex] = parsedComponents;
                }else 
                {
                    // Add the new parsed component
                    allParsedComponents.push(parsedComponents);
                }

                // Update the cache
                this.cacheManager.set(filePath, fileHash, parsedComponents);

                console.log("Changes detected. New Components saved.");
                console.log(`Cache updated: ${filePath}`);
            } else {
                console.error(`Error parsing file: ${filePath}`);
            }
        }
    }

    // Save the combined parsed components back to the file
    this.saveParsedComponents(allParsedComponents);
    console.log("Cache and file service Stopped");
    console.log("");
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
      const newContent = JSON.stringify(parsedComponents, null, 2);
      if (newContent) {
        fs.writeFileSync(filePath, newContent);
      } else {
        console.log("No parsedComponents.");
      }
    } catch (err) {
      console.error("Failed to save parsedComponents to file:", err);
    }
  }

  public getParsedComponentsFromFile(fileName?: string): FileParsedComponents[] {
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
  
  public getParsedComponentsByFileName(fileName: string): FileParsedComponents | null {
    try {
      const parsedComponents = this.getParsedComponentsFromFile();
  
      const matchingComponent = parsedComponents.find((component) =>
        component.classes.some((classGroup) => classGroup.fileName === fileName));

      if (!matchingComponent) {
        console.warn(`No data found for file name: ${fileName}`);
        return null;
      }
  
      return matchingComponent;
    } catch (err) {
      console.error(`Failed to get parsed components for file: ${fileName}`, err);
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
