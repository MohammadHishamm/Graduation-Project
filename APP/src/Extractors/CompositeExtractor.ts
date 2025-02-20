import Parser from "tree-sitter";

import { ClassGroup } from "../Interface/ClassGroup";
import { ClassExtractor } from "./ClassExtractor";
import { MethodExtractor  } from "./MethodExtractor";
import { FieldExtractor  } from "./FieldExtractor";

export class CompositeExtractor
{
  public extractClassGroup(
    rootNode: Parser.SyntaxNode,
    fileName: string
  ): ClassGroup[] {

    // Extract class declarations
    let classNodes = rootNode.descendantsOfType("class_declaration");
    const interfaceNodes = rootNode.descendantsOfType("interface_declaration");

    // Handle cases where no classes are found
    if (classNodes.length === 0) 
    {
      if (interfaceNodes.length !== 0)
      {
          classNodes = interfaceNodes;
      }
      else
      {
        console.warn(`No Data found in file: ${fileName}`);
        return [];
      }
    }

    const classextractor = new ClassExtractor();
    const methodextractor = new MethodExtractor();
    const fieldextractor = new FieldExtractor();

    // Extract classes, methods, and fields
    const classes = classextractor.extractClasses(rootNode);
    const methods = methodextractor.extractMethods(rootNode, classes);
    const fields = fieldextractor.extractFields(rootNode, methods);

    // Map class nodes into ClassGroup objects
    return classNodes.map((node) => ({
      fileName: fileName,
      name: node.childForFieldName("name")?.text ?? "Unknown",
      classes: classes,
      methods: methods,
      fields: fields,
    }));
  }
}