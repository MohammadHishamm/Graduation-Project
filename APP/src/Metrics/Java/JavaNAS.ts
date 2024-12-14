import Parser from "tree-sitter";

import { MetricCalculator } from "../../Core/MetricCalculator";
import { FileExtractComponentsFromCode } from "../../Extractors/FileExtractComponentsFromCode";
import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
import { MethodInfo } from "../../Interface/MethodInfo";

export class JavaNumberOfAddedServices extends MetricCalculator {
  // Return a Promise from calculate
  calculate(
    node: any,
    sourceCode: string,
    FECFC: FolderExtractComponentsFromCode
  ): number {
    const extractcomponentsfromcode = new FileExtractComponentsFromCode();
    const Classes = extractcomponentsfromcode.extractClasses(node);
    const methods = extractcomponentsfromcode.extractMethods(node, Classes);

    return this.findNAS(methods, node, FECFC);
  }

  private findNAS(
    methods: MethodInfo[],
    rootNode: Parser.SyntaxNode,
    FECFC: FolderExtractComponentsFromCode
  ): number {
    let NAS = 0;

    let extendedClass;

    const fileParsedComponents = FECFC.getParsedComponentsFromFile();

    const classNodes = rootNode.descendantsOfType("class_declaration");
    classNodes.forEach((node) => {
      // Try to find the 'superclass' node
      const extendsNode = node.childForFieldName("superclass");

      if (extendsNode) {
        // Extract the text and trim 'extends' from the start
        extendedClass = extendsNode.text.trim().replace(/^extends\s*/, "");
      }
    });

    if (extendedClass) {
      for (const method of methods) {
        if (method.isOverridden) {
          let found = false;
          for (const fileComponents of fileParsedComponents) {
            for (const classGroup of fileComponents.classes) {
              if (extendedClass === classGroup.name) {
                for (const classMethod of classGroup.methods) {
                  if (classMethod.name === method.name) {
                    found = true;
                  }
                }
              }
            }
          }

          if (!found) {
            NAS++;
          }
        } else {
          if (
            method.modifiers.includes("public") && // Only public methods
            !method.isConstructor && // Exclude constructors
            !method.isAccessor // Exclude getters and setters
          ) {
            NAS++;
          }
        }
      }
    } else {
      for (const method of methods) {
        if (
          method.modifiers.includes("public") && // Only public methods
          !method.isConstructor && // Exclude constructors
          !method.isAccessor // Exclude getters and setters
        ) {
          NAS++;
        }
      }
    }

    return NAS;
  }
}
