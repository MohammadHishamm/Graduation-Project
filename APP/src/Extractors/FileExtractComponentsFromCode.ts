import Parser from "tree-sitter";
import { FileParsedComponents } from "../Interface/FileParsedComponents";
import { ClassGroup } from "../Interface/ClassGroup";
import { ClassInfo } from "../Interface/ClassInfo";
import { MethodInfo } from "../Interface/MethodInfo";
import { FieldInfo } from "../Interface/FieldInfo";

export class FileExtractComponentsFromCode {
  public extractFileComponents(
    tree: Parser.Tree,
    fileName: string
  ): FileParsedComponents {
    const rootNode = tree.rootNode;

    const classgroup = this.extractClassGroup(rootNode, fileName);

    return {
      classes: classgroup,
    };
  }
  
  public extractClassGroup(
    rootNode: Parser.SyntaxNode,
    fileName: string
  ): ClassGroup[] {
    // Extract class declarations
    const classNodes = rootNode.descendantsOfType("class_declaration");
  
    // Handle cases where no classes are found
    if (classNodes.length === 0) {
      console.warn(`No classes found in file: ${fileName}`);
      return [];
    }
  
    // Extract classes, methods, and fields
    const classes = this.extractClasses(rootNode);
    const methods = this.extractMethods(rootNode, classes);
    const fields = this.extractFields(rootNode, classes);
  
    // Map class nodes into ClassGroup objects
    return classNodes.map((node) => ({
      fileName: fileName,
      name: node.childForFieldName("name")?.text ?? "Unknown",
      classes: classes,
      methods: methods,
      fields: fields,
    }));
  }
  


  public extractClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {

    let extendedClass: string;
    const classNodes = rootNode.descendantsOfType("class_declaration");
    let bodyNode : any;
    classNodes.forEach((node) => {
      // Try to find the 'superclass' node
      const extendsNode = node.childForFieldName("superclass");
       bodyNode = node.childForFieldName("body"); // Extract class body

      if (extendsNode) {
        // Extract the text and trim 'extends' from the start
        extendedClass = extendsNode.text.trim().replace(/^(extends|implements)\s*/, "");
      }
    });

    return classNodes.map((node) => ({
      name: node.childForFieldName("name")?.text ?? "Unknown",
      extendedclass: extendedClass,
      isAbstract: node.children.some(
        (child) => child.type === "modifier" && child.text === "abstract"
      ),
      isInterface: node.type === "interface_declaration",
      startPosition: bodyNode?.startPosition ?? node.startPosition, // Use body start
      endPosition: bodyNode?.endPosition ?? node.endPosition, // Use body end

    }));

  }

  public extractMethods(
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
      if (isAccessor) {

      }
      const fieldsUsed = this.extractFieldsUsedInMethod(node);

      return {
        name,
        modifiers: accessModifier, // Use only the access modifier (e.g., 'public')
        params,
        isConstructor,
        isAccessor,
        isOverridden, // Add the isOverridden field to the return value
        fieldsUsed, // Add the list of fields used in the method
        startPosition: node.startPosition,
        endPosition: node.endPosition,
      };
    });
  }

  // New method to extract fields used in a method's body
  public extractFieldsUsedInMethod(node: Parser.SyntaxNode): string[] {
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
  public isAccessor(methodName: string): boolean {
    return /^get[A-Z]/.test(methodName) || /^set[A-Z]/.test(methodName);
  }

  public isClass(rootNode: Parser.SyntaxNode): boolean {

    const classNodes = rootNode.descendantsOfType("class_declaration");
    let isAbstract;
    let isInterface;

    classNodes.forEach((classNode) => {
      // Check if the class is abstract
      isAbstract = classNode.children.some(
        (child) => child.type === "modifier" && child.text === "abstract"
      );

      // Check if the node is an interface
      isInterface = classNode.type === "interface_declaration";
    });

    if (classNodes || isInterface || isAbstract) {
      console.log(classNodes, isInterface, isAbstract);
      return true;
    }


    return false;
  }
  // Find the parent class for a given node
  public findParentClass(
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

  public extractFields(
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

  // Method to extract the fields used in a specific method
  public getFieldsUsedInMethod(
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

  public filterPublicNonEncapsulatedFields(
    fields: FieldInfo[],
    methods: MethodInfo[]
  ): FieldInfo[] {
    return fields.filter(
      (field) =>
        field.modifiers.includes("public") &&
        !this.hasGetterSetter(field.name, methods)
    );
  }

  // Check if the field has getter or setter methods
  public hasGetterSetter(fieldName: string, methods: MethodInfo[]): boolean {
    const getterPattern = new RegExp(
      `get${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}\\(`
    );
    const setterPattern = new RegExp(
      `set${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}\\(`
    );

    return methods.some(
      (method) =>
        getterPattern.test(method.name) || setterPattern.test(method.name)
    );
  }
}
