import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

import Parser from "tree-sitter";
import java from "tree-sitter-java";

import { FileParsedComponents } from "../Interface/FileParsedComponents";
import { FileExtractComponentsFromCode } from "./FileExtractComponentsFromCode";
import { FileCacheManager } from "../Cache/FileCacheManager";

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
    const allParsedComponents: FileParsedComponents[] = [];

    for (const fileUri of javaFiles) {
      const filePath = fileUri.fsPath;

      const fileContent = await this.fetchFileContent(fileUri);

      const fileHash = FileCacheManager.computeHash(fileContent);

      const cachedComponents = this.cacheManager.get(filePath, fileHash);

      if (cachedComponents) {
        console.log(`Cache hit: ${filePath}`);
      } else {
        const parsedComponents = await this.parseFile(fileUri);
        if (parsedComponents) {
          allParsedComponents.push(parsedComponents);
          this.cacheManager.set(filePath, fileHash, parsedComponents);

          this.saveParsedComponents(allParsedComponents);
          console.log("changes detected , New Metrics saved");
          console.log(`Cache updated: ${filePath}`);
        } else {
          console.error(`Error parsing file: ${filePath}`);
        }
      }
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

  public getParsedComponentsFromFile(): FileParsedComponents[] {
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

      return JSON.parse(fileContent) as FileParsedComponents[];
    } catch (err) {
      console.error("Failed to read parsed components from file:", err);
      return [];
    }
  }

  public async parseFile(
    fileUri: vscode.Uri
  ): Promise<FileParsedComponents | null> {
    try {
      const fileContent = await this.fetchFileContent(fileUri);

      const tree = this.parseCode(fileContent);

      const extractcomponentsfromcode = new FileExtractComponentsFromCode();
      return extractcomponentsfromcode.extractFileComponents(tree, fileUri.fsPath);
    } catch (error) {
      console.error("Error parsing file ${fileUri.fsPath}:, error");
      return null;
    }
  }

  private async fetchFileContent(fileUri: vscode.Uri): Promise<string> {
    const fileContent = await vscode.workspace.fs.readFile(fileUri);
    return Buffer.from(fileContent).toString("utf8");
  }

  public parseCode(sourceCode: string): Parser.Tree {
    return this.parser.parse(sourceCode);
  }


}
