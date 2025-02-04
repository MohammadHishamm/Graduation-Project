import Parser from "tree-sitter";

import { ClassInfo } from "../Interface/ClassInfo";
import { MethodInfo } from "../Interface/MethodInfo";

export class MethodExtractor {
  // Extract Method Parameters with Types and Annotations
  private extractMethodParams(node: Parser.SyntaxNode): string[] {
    const params: string[] = [];
    const paramNodes = node.descendantsOfType("formal_parameter");
    paramNodes.forEach((paramNode) => {
      const typeNode = paramNode.childForFieldName("type");
      const type = typeNode ? typeNode.text : "Unknown"; // Extract parameter type
      const nameNode = paramNode.childForFieldName("name");
      const name = nameNode ? nameNode.text : "Unnamed"; // Extract parameter name
      const annotations = this.extractParameterAnnotations(paramNode); // Extract annotations
      params.push(`${annotations.join(", ")} ${type} ${name}`);
    });
    return params;
  }

  private extractParameterAnnotations(node: Parser.SyntaxNode): string[] {
    const annotations: string[] = [];
    const annotationNodes = node.descendantsOfType("annotation");
    annotationNodes.forEach((annotation) => {
      annotations.push(annotation.text);
    });
    return annotations;
  }

  // Extract Access Modifiers like static, final, synchronized, etc.
  private extractMethodModifiers(node: Parser.SyntaxNode): string[] {
    const modifiers: string[] = [];
    const methodText = node.text;
    const possibleModifiers = [
      "public",
      "private",
      "protected",
      "static",
      "final",
      "synchronized",
    ];

    possibleModifiers.forEach((mod) => {
      if (methodText.split(/\s+/)[0] === mod) {
        modifiers.push(mod);
      }
    });

    return modifiers;
  }

  private extractStatementsRecursively(
    node: Parser.SyntaxNode,
    bodyStatements: string[]
  ) {
    if (node.type === "if_statement") {
      bodyStatements.push(node.type);
    } else if (node.type === "for_statement") {
      bodyStatements.push(node.type);
    } else if (node.type === "while_statement") {
      bodyStatements.push(node.type);
    } else if (node.type === "do_statement") {
      bodyStatements.push(node.type);
    } else if (node.type === "try_statement") {
      bodyStatements.push(node.type);
    } else if (node.type === "expression_statement") {
      bodyStatements.push(node.type);
    } else if (node.type === "break_statement") {
      bodyStatements.push(node.type);
    } else if (node.type === "continue_statement") {
      bodyStatements.push(node.type);
    } else if (node.type === "ternary_expression") {
      bodyStatements.push(node.type);
    } else if (node.type === "condition" || node.type === "binary_expression") {
      const conditionText = node.text || "";
      const booleanOperators = (conditionText.match(/&&|\|\|/g) || []).length;
      if (booleanOperators > 0) {
        bodyStatements.push("condition: " + conditionText);
      }
    } else if (node.type === "catch_clause") {
      bodyStatements.push(node.type);
    } else if (node.type === "case") {
      bodyStatements.push(node.type);
    } else if (node.type === "throw_statement") {
      bodyStatements.push(node.type);
    }

    node.children.forEach((child) => {
      this.extractStatementsRecursively(child, bodyStatements);
    });
  }

  // Call this function instead of looping manually
  private extractStatements(bodyNode: Parser.SyntaxNode): string[] {
    const bodyStatements: string[] = [];
    if (bodyNode) {
      this.extractStatementsRecursively(bodyNode, bodyStatements);
    }
    return bodyStatements;
  }

  // Extract Local Variables Declared Inside the Method
  private extractLocalVariables(node: Parser.SyntaxNode): string[] {
    const localVars: string[] = [];
    const bodyNode = node.childForFieldName("body");

    if (bodyNode) {
      bodyNode
        .descendantsOfType("variable_declarator")
        .forEach((declarator) => {
          const varName =
            declarator.childForFieldName("name")?.text ?? "Unnamed";

          // Try to find the type in the parent node (e.g., variable_declaration)
          const parent = declarator.parent;
          const varType = parent?.childForFieldName("type")?.text;
          parent?.child(0)?.text; // Sometimes the type is the first child
          ("Unknown");

          localVars.push(`${varType}`);
        });
    }
    return localVars;
  }

  // Track Method Calls Inside the Method Body
  private extractMethodCalls(node: Parser.SyntaxNode): string[] {
    const methodCalls: string[] = [];
    const bodyNode = node.childForFieldName("body");

    if (bodyNode) {
      bodyNode.descendantsOfType("method_invocation").forEach((callNode) => {
        const objectNode = callNode.childForFieldName("object");
        const methodNode = callNode.childForFieldName("name");

        if (objectNode && methodNode) {
          methodCalls.push(`${objectNode.text}.${methodNode.text}`);
        } else if (methodNode) {
          methodCalls.push(methodNode.text); // For static calls without object
        }
      });
    }

    return methodCalls;
  }

  // Extract Method Information Including All Details
  public extractMethods(
    rootNode: Parser.SyntaxNode,
    classes: ClassInfo[]
  ): MethodInfo[] {
    const methodNodes = rootNode.descendantsOfType("method_declaration");

    return methodNodes.map((node) => {
      const modifiers = this.extractMethodModifiers(node);
      const isOverridden = this.isOverriddenMethod(node);
      const accessModifier = this.getAccessModifier(modifiers);
      const name = this.extractMethodName(node);
      const params = this.extractMethodParams(node);
      const returnType = this.extractMethodReturnType(node);
      const parentClass = this.findParentClass(node, classes);
      const isConstructor = this.isConstructorMethod(name, parentClass);
      const isAccessor = this.isAccessor(node, name);
      const fieldsUsed = this.getFieldsUsedInMethod(node, name);
      const annotations = this.extractMethodAnnotations(node);
      const throwsClause = this.extractThrowsClause(node);
      const methodBody = this.extractStatements(node);
      const localVariables = this.extractLocalVariables(node);
      const methodCalls = this.extractMethodCalls(node);

      return {
        name,
        modifiers: accessModifier,
        params,
        returnType,
        isConstructor,
        isAccessor,
        isOverridden,
        fieldsUsed,
        annotations,
        throwsClause,
        methodBody,
        localVariables,
        methodCalls,
        startPosition: node.startPosition,
        endPosition: node.endPosition,
      };
    });
  }

  // Helper Methods (to be defined)
  private isOverriddenMethod(node: Parser.SyntaxNode): boolean {
    const annotationNodes = node.descendantsOfType("marker_annotation");

    if (annotationNodes.length > 0) {
      return true;
    }

    return false;
  }

  private getAccessModifier(modifiers: string[]): string {
    const accessModifier = modifiers.find((mod) =>
      ["public", "private", "protected"].includes(mod)
    );

    return accessModifier || "public";
  }

  private extractMethodName(node: Parser.SyntaxNode): string {
    const nameNode = node.childForFieldName("name");
    return nameNode ? nameNode.text : "Unknown";
  }

  private extractMethodReturnType(node: Parser.SyntaxNode): string {
    const returnTypeNode = node.childForFieldName("return_type");
    return returnTypeNode ? returnTypeNode.text : "void";
  }

  private findParentClass(
    node: Parser.SyntaxNode,
    classes: ClassInfo[]
  ): ClassInfo | null {
    const className =
      node.parent?.type === "class_declaration" ? node.parent.text : "";
    return classes.find((classInfo) => classInfo.name === className) ?? null;
  }

  private isConstructorMethod(
    name: string,
    parentClass: ClassInfo | null
  ): boolean {
    return parentClass ? name === parentClass.name : false;
  }

  public isAccessor(rootNode: Parser.SyntaxNode, methodName: string): boolean {
    let isAccessor = false;

    // Check if the method name matches a getter or setter naming convention
    if (/^get[A-Z]/.test(methodName) || /^set[A-Z]/.test(methodName)) {
      const methodNodes = rootNode.descendantsOfType("method_declaration");

      methodNodes.forEach((node) => {
        const nameNode = node.childForFieldName("name")?.text;
        if (nameNode === methodName) {
          const bodyNode = node.childForFieldName("body");
          if (bodyNode) {
            const statements = bodyNode.children;

            // Ensure the body has only [SyntaxNode, ReturnStatementNode, SyntaxNode] for get or  [SyntaxNode, ExpressionStatementNode, SyntaxNode] for set
            if (statements.length === 3) {
              // get the middle statment returnstatment or expressionstatment
              const statement = statements[1];

              if (statement.type === "expression_statement") {
                // get the return statment and gets its child which is field accesed so it is a set
                const returnValue = statement.childrenForFieldName(
                  "ExpressionStatementNode"
                );

                if (returnValue) {
                  isAccessor = true;
                }
              } else if (statement.type === "return_statement") {
                // get the return statment and gets its child which is field accesed so it is a get
                const returnValue =
                  statement.childrenForFieldName("FieldAccessNode");

                if (returnValue) {
                  isAccessor = true;
                }
              }
            }
          }
        }
        return isAccessor;
      });
    }

    return isAccessor;
  }

  public getFieldsUsedInMethod(
    rootNode: Parser.SyntaxNode,
    MethodName: string
  ): string[] {
    const fieldsUsed: string[] = [];

    const accessNodes = rootNode.descendantsOfType("variable_declarator");
    accessNodes.forEach((accessNode) => {
      const fieldName = accessNode.text;
      if (
        fieldName &&
        !fieldsUsed.includes(fieldName) &&
        fieldName !== MethodName
      ) {
        const identifierNode = accessNode.children.find(
          (subChild) => subChild.type === "identifier"
        );
        if (identifierNode) {
          fieldsUsed.push(identifierNode.text); // Add unique field names accessed
        }
      }
    });

    return fieldsUsed;
  }

  private extractMethodAnnotations(node: Parser.SyntaxNode): string[] {
    const annotations: string[] = [];
    const annotationNodes = node.descendantsOfType("marker_annotation");
    annotationNodes.forEach((annotation) => {
      annotations.push(annotation.text);
    });
    return annotations;
  }

  private extractThrowsClause(node: Parser.SyntaxNode): string[] {
    const throwsNodes = node.descendantsOfType("throw_statement");
    return throwsNodes.map((throwNode) => throwNode.text);
  }
}
