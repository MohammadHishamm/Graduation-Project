import Parser from "tree-sitter";
import Java, { name } from "tree-sitter-java";
import {
  ParsedComponents,
  ClassInfo,
  MethodInfo,
  FieldInfo,
} from "../../Interface/ParsedComponents"; // Import the interface
import { MetricCalculator } from "../../Core/MetricCalculator";

export class TCCCalculation extends MetricCalculator {
  calculate(node: any): number {
    return this.extractComponents(node.tree);
  }

  // Extract components and classify methods
  extractComponents(tree: Parser.Tree): number {
    const rootNode = tree.rootNode;

    const classes = this.extractClasses(rootNode);
    const methods = this.extractMethods(rootNode, classes);
    const FieldsUsed = this.extractFields(rootNode, classes);
    const tcc = this.calculateTCC(rootNode, methods, FieldsUsed);

    return tcc;
  }

  private extractClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {
    const classNodes = rootNode.descendantsOfType("class_declaration");
    return classNodes.map((node) => ({
      name: node.childForFieldName("name")?.text ?? "Unknown",
      startPosition: node.startPosition,
      endPosition: node.endPosition,
    }));
  }

  private extractMethods(
    rootNode: Parser.SyntaxNode,
    classes: ClassInfo[]
  ): MethodInfo[] {
    const methodNodes = rootNode.descendantsOfType("method_declaration");

    return methodNodes.map((node) => {
      // Dynamically find modifiers as a child node
      const modifiersNode = node.children.find(
        (child) => child.type === "modifiers"
      );
      const modifiers = modifiersNode ? modifiersNode.text : "";

      // Check if the method is overridden by looking for '@Override' in the modifiers
      const isOverridden = modifiers.includes("@Override");

      // Strip '@Override' and keep only the access modifier (e.g., 'public')
      const accessModifier = modifiers
        .replace("@Override", "")
        .trim()
        .split(" ")[0];

      const name = node.childForFieldName("name")?.text ?? "Unknown";
      const params = node.childForFieldName("parameters")?.text ?? "";
      const parentClass = this.findParentClass(node, classes);

      const isConstructor = parentClass ? parentClass.name === name : false;
      const isAccessor = this.isAccessor(name);

      // Extract all fields used by this method
      const fieldsUsed = this.extractFieldsUsedInMethod(node);

      return {
        name,
        modifiers: accessModifier, // Use only the access modifier (e.g., 'public')
        isConstructor,
        isAccessor,
        isOverridden, // Add the isOverridden field to the return value
        startPosition: node.startPosition,
        endPosition: node.endPosition,
        fieldsUsed, // Add the list of fields used in the method
      };
    });
  }

  // New method to extract fields used in a method's body
  private extractFieldsUsedInMethod(node: Parser.SyntaxNode): string[] {
    const fieldsUsed: string[] = [];

    // Find all access expressions (variables accessed) in the method's body
    const bodyNode = node.childForFieldName("body");
    if (bodyNode) {
      // Look for all variable names that are accessed
      const accessNodes = bodyNode.descendantsOfType("identifier");
      accessNodes.forEach((accessNode) => {
        const fieldName = accessNode.text;
        if (fieldName && !fieldsUsed.includes(fieldName)) {
          fieldsUsed.push(fieldName); // Add unique field names accessed
        }
      });
    }

    return fieldsUsed;
  }

  // Check if a method is an accessor (getter or setter)
  private isAccessor(methodName: string): boolean {
    return /^get[A-Z]/.test(methodName) || /^set[A-Z]/.test(methodName);
  }

  // Find the parent class for a given node
  private findParentClass(
    node: Parser.SyntaxNode,
    classes: ClassInfo[]
  ): ClassInfo | null {
    for (const cls of classes) {
      if (
        node.startPosition.row >= cls.startPosition.row &&
        node.endPosition.row <= cls.endPosition.row
      ) {
        return cls;
      }
    }
    return null;
  }
  // Calculate TCC based on methods and fields

  private extractFields(
    rootNode: Parser.SyntaxNode,
    classes: ClassInfo[]
  ): FieldInfo[] {
    // Find all the field declaration nodes in the syntax tree
    const fieldNodes = rootNode.descendantsOfType("field_declaration");

    return fieldNodes.map((node) => {
      // Log node to inspect its children (useful for debugging)
      // console.log('Field Node:', node.toString());

      // The modifiers are usually on the first child (public, private, etc.)
      const modifiersNode = node.child(0); // Use child(0) to access the first child
      const modifiers = modifiersNode ? modifiersNode.text : "";

      // The type of the field (like int, String)
      const typeNode = node.child(1); // Access second child for the type
      const type = typeNode ? typeNode.text : "";

      // The name of the field is usually the third child
      const nameNode = node.child(2); // Access third child for the name
      const name = nameNode ? nameNode.text : "Unknown";

      // Return the field information
      return {
        name,
        type,
        modifiers,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
      };
    });
  }

  // Check if two methods are directly connected

  // Simulate field usage extraction for a method
  private calculateTCC(
    rootNode: Parser.SyntaxNode,
    methods: MethodInfo[],
    fields: FieldInfo[]
  ): number {
    let pairs = 0;

    for (let i = 0; i < methods.length; i++) {
      if (!methods[i].isConstructor) {
        const methodA = methods[i];
        const fieldsA = this.getFieldsUsedInMethod(rootNode, methodA);

        let key = true;
        for (let j = 0; j < methods.length; j++) {
          if (!methods[j].isConstructor && methodA.name !== methods[j].name) {
            const methodB = methods[j];
            const fieldsB = this.getFieldsUsedInMethod(rootNode, methodB);

            // Check for any shared field
            for (const field of fieldsA) {
              if (fieldsB.includes(field) && key) {
                for (const classfields of fields) {
                  if (classfields.name !== field) {
                    pairs++; // Increment shared connections
                    key = false;
                    break; // Exit as one shared field is enough
                  }
                }
              }
            }
          }
          if (!key) {
            break;
          }
        }
      }
    }

    // Calculate and return TCC
    const nummeth = methods.length;

    const tcc = ((pairs - 1) * pairs) / (nummeth * (nummeth - 1));
     
    if(nummeth === 0 || nummeth=== 1)
    {
        return nummeth;
    }
    else{
    return tcc;
    }
  }

  // Method to extract the fields used in a specific method
  private getFieldsUsedInMethod(
    rootNode: Parser.SyntaxNode,
    method: MethodInfo
  ): string[] {
    const fieldsUsed: string[] = [];

    // Find the method node based on its name
    const methodNode = rootNode
      .descendantsOfType("method_declaration")
      .find((node) => node.childForFieldName("name")?.text === method.name);

    if (methodNode) {
      // Find all access expressions (variables accessed) in the method's body
      const bodyNode = methodNode.childForFieldName("body");
      if (bodyNode) {
        // Look for all variable names that are accessed
        const accessNodes = bodyNode.descendantsOfType("identifier");
        accessNodes.forEach((accessNode) => {
          const fieldName = accessNode.text;
          if (fieldName && !fieldsUsed.includes(fieldName)) {
            fieldsUsed.push(fieldName); // Add unique field names accessed
          }
        });
      }
    }

    return fieldsUsed;
  }
}
