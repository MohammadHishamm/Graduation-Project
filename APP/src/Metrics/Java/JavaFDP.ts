import Parser from "tree-sitter";

import { MetricCalculator } from "../../Core/MetricCalculator";

import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
import { FileParsedComponents } from "../../Interface/FileParsedComponents";
import { MethodInfo } from "../../Interface/MethodInfo";
interface Reference {
  name: string;
  type: "field" | "method";
}

export class JavaAccessofImportData extends MetricCalculator {
  calculate(node: any,  FECFC: FolderExtractComponentsFromCode, Filename: string): number  {
    let allClasses: ClassInfo[] = [];
    let allMethods: MethodInfo[] = [];
    let allFields: FieldInfo[] = [];

    const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);

    if (fileParsedComponents) 
      {
        const classGroups = fileParsedComponents.classes;
        classGroups.forEach((classGroup) => 
        {
          allClasses = allClasses.concat(classGroup.classes);
          allMethods = allMethods.concat(classGroup.methods);
          allFields = allFields.concat(classGroup.fields);
        });
      }


    const FDP = this.calculateFDP(node, allClasses, allMethods, allFields, FECFC);

    return FDP;
  }

  private calculateFDP(
    rootNode: Parser.SyntaxNode,
    currentClasses: ClassInfo[],
    methods: MethodInfo[],
    fields: FieldInfo[],
    FECFC: FolderExtractComponentsFromCode
  ): number {
    // Track unique foreign classes accessed
    const foreignClassesAccessed = new Set<string>();

    // Check each method for foreign data access
    methods.forEach((method) => {
      // Find the method's node in the syntax tree
      const methodNode = this.findMethodNodeByPosition(rootNode, method);
      if (!methodNode) {
        return;
      }

      // Get all fields from current class and its ancestors
      const currentClassFields = this.getClassAndAncestorFields(
        method,
        currentClasses,
        fields
      );

      // Extract references within the method
      const references = this.extractReferencesFromMethod(methodNode, FECFC);

      references.forEach((reference) => {
        // Skip if reference is a local class field
        if (currentClassFields.includes(reference.name)) {
          return;
        }

        // Determine the class of the referenced entity
        const referenceClass = this.findReferenceOwnerClass(
          reference,
          currentClasses
        );

        // Check if the reference is from a different class and not an ancestor
        if (
          referenceClass &&
          !this.isLocalClassAccess(referenceClass, currentClasses)
        ) {
          foreignClassesAccessed.add(referenceClass.name);
        }
      });
    });

    // console.log(
    //   "[FDP] Foreign Classes Accessed:",
    //   Array.from(foreignClassesAccessed)
    // );
    return foreignClassesAccessed.size;
  }

  private findMethodNodeByPosition(
    rootNode: Parser.SyntaxNode,
    method: MethodInfo
  ): Parser.SyntaxNode | null {
    const findMethodNode = (
      node: Parser.SyntaxNode
    ): Parser.SyntaxNode | null => {
      // Check if the node is a method declaration and matches the position
      if (
        node.type === "method_declaration" &&
        this.isNodePositionMatch(node, method.startPosition, method.endPosition)
      ) {
        return node;
      }

      // Recursively search child nodes
      for (let child of node.children) {
        const foundNode = findMethodNode(child);
        if (foundNode) {return foundNode;}
      }

      return null;
    };

    return findMethodNode(rootNode);
  }

  private isNodePositionMatch(
    node: Parser.SyntaxNode,
    startPos: Parser.Point,
    endPos: Parser.Point
  ): boolean {
    const nodeStart = node.startPosition;
    const nodeEnd = node.endPosition;

    return (
      nodeStart.row === startPos.row &&
      nodeStart.column === startPos.column &&
      nodeEnd.row === endPos.row &&
      nodeEnd.column === endPos.column
    );
  }

  /**
   * Get fields from the current class and its ancestors
   */
  private getClassAndAncestorFields(
    method: MethodInfo,
    classes: ClassInfo[],
    fields: FieldInfo[]
  ): string[] {
    // Find the class containing the method
    const containingClass = classes.find(
      (cls) =>
        method.startPosition.row >= cls.startPosition.row &&
        method.endPosition.row <= cls.endPosition.row
    );

    if (!containingClass) {return [];}

    // Collect fields from the current class and its ancestors
    const classFields = fields
      .filter(
        (field) =>
          field.startPosition.row >= containingClass.startPosition.row &&
          field.startPosition.row <= containingClass.endPosition.row
      )
      .map((field) => field.name);

    // If the class has a parent, also include fields from parent classes
    if (containingClass.parent) {
      const parentClass = classes.find(
        (cls) => cls.name === containingClass.parent
      );
      if (parentClass) {
        const parentFields = fields
          .filter(
            (field) =>
              field.startPosition.row >= parentClass.startPosition.row &&
              field.startPosition.row <= parentClass.endPosition.row
          )
          .map((field) => field.name);

        return [...classFields, ...parentFields];
      }
    }

    return classFields;
  }

  /**
   * Extract references from a method node
   */
  private extractReferencesFromMethod(
    methodNode: Parser.SyntaxNode,
    FECFC: FolderExtractComponentsFromCode
  ): Reference[] {
    const references: Reference[] = [];

    // Helper function to traverse and find references
    const findReferences = (node: Parser.SyntaxNode) => {
      // Check for field or method references
      if (node.type === "identifier") {
        references.push({
          name: node.text,
          type: this.determineReferenceType(node, FECFC),
        });
      }

      // Recursively search child nodes
      for (let child of node.children) {
        findReferences(child);
      }
    };

    findReferences(methodNode);

    // Remove duplicates
    return Array.from(new Set(references.map((r) => r.name)))
      .map((name) => references.find((r) => r.name === name)!)
      .filter(Boolean);
  }

  /**
   * Determine if a reference is a field or method
   */
  private determineReferenceType(
    node: Parser.SyntaxNode,
    FECFC: FolderExtractComponentsFromCode
  ): "field" | "method" {
    // This is a simplified implementation. You might need to enhance it.
    const parsedComponents = FECFC.getParsedComponentsFromFile();

    for (const fileComponents of parsedComponents) {
      for (const classInfo of fileComponents.classes) {
        // Check if the reference is a field
        const isField = classInfo.fields.some((f) => f.name === node.text);
        if (isField) {
          return "field";
        }

        // Check if the reference is a method
        const isMethod = classInfo.methods.some((m) => m.name === node.text);
        if (isMethod) {
          return "method";
        }
      }
    }

    return "field"; // Default to field if cannot determine
  }

  /**
   * Find the class that owns the referenced entity
   */
  private findReferenceOwnerClass(
    reference: Reference,
    currentClasses: ClassInfo[]
  ): ClassInfo | undefined {
    const parsedComponents = this.getParsedComponentsFromFolder();

    for (const fileComponents of parsedComponents) {
      for (const classInfo of fileComponents.classes) {
        const matchField = classInfo.fields.some(
          (f) =>
            f.name.split(" ")[0] === reference.name &&
            reference.type === "field"
        );

        const matchMethod = classInfo.methods.some(
          (m) => m.name === reference.name && reference.type === "method"
        );

        if (matchField || matchMethod) {
          return {
            name: classInfo.name,
            isAbstract: false,
            isInterface: false,
            startPosition: { row: 0, column: 0 },
            endPosition: { row: 0, column: 0 },
          };
        }
      }
    }

    return undefined;
  }
  /**
   * Check if the reference is from a local class or its ancestors
   */
  private isLocalClassAccess(
    referenceClass: ClassInfo,
    currentClasses: ClassInfo[]
  ): boolean {
    // Check if the reference class is in the current set of classes
    const isInCurrentClasses = currentClasses.some(
      (cls) => cls.name === referenceClass.name
    );

    // Check for ancestor relationship
    const hasAncestorRelationship = currentClasses.some(
      (cls) => cls.parent === referenceClass.name
    );

    return isInCurrentClasses || hasAncestorRelationship;
  }

  private getParsedComponentsFromFolder(): FileParsedComponents[] {
    const folderExtractor = new FolderExtractComponentsFromCode();
    return folderExtractor.getParsedComponentsFromFile();
  }
}
