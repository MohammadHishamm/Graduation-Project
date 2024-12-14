import Parser from "tree-sitter";
import Java from "tree-sitter-java";
import { MetricCalculator } from "../../Core/MetricCalculator";

import { FileParsedComponents } from "../../Interface/FileParsedComponents";
import { ClassInfo } from "../../Interface/ClassInfo";

export class NODDCalculation extends MetricCalculator {
  calculate(node: any): number {
    return this.calculateNODDForFirstClass(node.tree);
  }

  // Calculate NODD for the first class found in the file
  private calculateNODDForFirstClass(tree: Parser.Tree): number {
    const rootNode = tree.rootNode;

    const classes = this.extractClasses(rootNode);
    if (classes.length === 0) {
      throw new Error("No classes found in the file.");
    }

    const inheritanceMap = this.buildInheritanceMap(classes);
    const firstClass = classes[0]; // Get the first class in the file

    return this.calculateNODD(firstClass.name, inheritanceMap);
  }

  // Extract class information, including inheritance relationships
  private extractClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {
    const classNodes = rootNode.descendantsOfType("class_declaration");

    return classNodes.map((node) => {
      const name = node.childForFieldName("name")?.text ?? "Unknown";

      let parent: string | undefined = undefined;

      const superclassNode = node.childForFieldName("superclass");
      if (superclassNode) {
        parent = superclassNode.text.replace(/^extends\s+/, ""); // Remove "extends"
      }

      const implementsNode = node.children.find(
        (child) => child.type === "implements"
      );
      if (implementsNode) {
        parent = implementsNode.child(0)?.text?.replace(/^implements\s+/, ""); // Remove "implements"
      }

      return {
        name,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        parent,
      };
    });
  }

  // Build a map of inheritance relationships
  private buildInheritanceMap(classes: ClassInfo[]): Record<string, string[]> {
    const inheritanceMap: Record<string, string[]> = {};

    classes.forEach((cls) => {
      if (cls.parent) {
        if (!inheritanceMap[cls.parent]) {
          inheritanceMap[cls.parent] = [];
        }
        inheritanceMap[cls.parent].push(cls.name);
      }
    });

    return inheritanceMap;
  }

  // Calculate NODD for a given class
  private calculateNODD(
    className: string,
    inheritanceMap: Record<string, string[]>
  ): number {
    const directDescendants = inheritanceMap[className] || [];

    return directDescendants.length; // Return count of direct descendants
  }
}
