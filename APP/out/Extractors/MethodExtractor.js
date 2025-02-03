"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodExtractor = void 0;
class MethodExtractor {
    // Extract Method Parameters with Types and Annotations
    extractMethodParams(node) {
        const params = [];
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
    extractParameterAnnotations(node) {
        const annotations = [];
        const annotationNodes = node.descendantsOfType("annotation");
        annotationNodes.forEach((annotation) => {
            annotations.push(annotation.text);
        });
        return annotations;
    }
    // Extract Access Modifiers like static, final, synchronized, etc.
    extractMethodModifiers(node) {
        const modifiers = [];
        const modifierNodes = node.descendantsOfType("modifier");
        modifierNodes.forEach((modifier) => {
            modifiers.push(modifier.text);
        });
        return modifiers;
    }
    extractStatementsRecursively(node, bodyStatements) {
        if (node.type === "if_statement") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "for_statement") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "while_statement") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "do_statement") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "try_statement") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "expression_statement") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "break_statement") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "continue_statement") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "ternary_expression") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "condition" || node.type === "binary_expression") {
            const conditionText = node.text || "";
            const booleanOperators = (conditionText.match(/&&|\|\|/g) || []).length;
            if (booleanOperators > 0) {
                bodyStatements.push("condition: " + conditionText);
            }
        }
        else if (node.type === "catch_clause") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "case") {
            bodyStatements.push(node.type);
        }
        else if (node.type === "throw_statement") {
            bodyStatements.push(node.type);
        }
        node.children.forEach((child) => {
            this.extractStatementsRecursively(child, bodyStatements);
        });
    }
    // Call this function instead of looping manually
    extractStatements(bodyNode) {
        const bodyStatements = [];
        if (bodyNode) {
            this.extractStatementsRecursively(bodyNode, bodyStatements);
        }
        return bodyStatements;
    }
    // Extract Local Variables Declared Inside the Method
    extractLocalVariables(node) {
        const localVars = [];
        const bodyNode = node.childForFieldName("body");
        if (bodyNode) {
            bodyNode
                .descendantsOfType("variable_declarator")
                .forEach((declarator) => {
                const varName = declarator.childForFieldName("name")?.text ?? "Unnamed";
                const varType = declarator.childForFieldName("type")?.text ?? "Unknown";
                localVars.push(`${varType} ${varName}`);
            });
        }
        return localVars;
    }
    // Track Method Calls Inside the Method Body
    extractMethodCalls(node) {
        const methodCalls = [];
        const bodyNode = node.childForFieldName("body");
        const traverse = (currentNode) => {
            console.log("sas", currentNode.type);
            // Recursively traverse child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };
        traverse(node);
        if (bodyNode) {
            bodyNode.descendantsOfType("method_invocation").forEach((callNode) => {
                const objectNode = callNode.childForFieldName("object");
                const methodNode = callNode.childForFieldName("name");
                if (objectNode && methodNode) {
                    methodCalls.push(`${objectNode.text}.${methodNode.text}`);
                }
                else if (methodNode) {
                    methodCalls.push(methodNode.text); // For static calls without object
                }
            });
        }
        return methodCalls;
    }
    // Extract Method Information Including All Details
    extractMethods(rootNode, classes) {
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
    isOverriddenMethod(node) {
        const annotationNodes = node.descendantsOfType("marker_annotation");
        if (annotationNodes.length > 0) {
            return true;
        }
        return false;
    }
    getAccessModifier(modifiers) {
        const modifier = modifiers.find((mod) => ["public", "private", "protected"].includes(mod));
        return modifier ?? "public";
    }
    extractMethodName(node) {
        const nameNode = node.childForFieldName("name");
        return nameNode ? nameNode.text : "Unknown";
    }
    extractMethodReturnType(node) {
        const returnTypeNode = node.childForFieldName("return_type");
        return returnTypeNode ? returnTypeNode.text : "void";
    }
    findParentClass(node, classes) {
        const className = node.parent?.type === "class_declaration" ? node.parent.text : "";
        return classes.find((classInfo) => classInfo.name === className) ?? null;
    }
    isConstructorMethod(name, parentClass) {
        return parentClass ? name === parentClass.name : false;
    }
    isAccessor(rootNode, methodName) {
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
                                const returnValue = statement.childrenForFieldName("ExpressionStatementNode");
                                if (returnValue) {
                                    isAccessor = true;
                                }
                            }
                            else if (statement.type === "return_statement") {
                                // get the return statment and gets its child which is field accesed so it is a get
                                const returnValue = statement.childrenForFieldName("FieldAccessNode");
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
    getFieldsUsedInMethod(rootNode, MethodName) {
        const fieldsUsed = [];
        const accessNodes = rootNode.descendantsOfType("variable_declarator");
        accessNodes.forEach((accessNode) => {
            const fieldName = accessNode.text;
            if (fieldName &&
                !fieldsUsed.includes(fieldName) &&
                fieldName !== MethodName) {
                const identifierNode = accessNode.children.find((subChild) => subChild.type === "identifier");
                if (identifierNode) {
                    fieldsUsed.push(identifierNode.text); // Add unique field names accessed
                }
            }
        });
        return fieldsUsed;
    }
    extractMethodAnnotations(node) {
        const annotations = [];
        const annotationNodes = node.descendantsOfType("marker_annotation");
        annotationNodes.forEach((annotation) => {
            annotations.push(annotation.text);
        });
        return annotations;
    }
    extractThrowsClause(node) {
        const throwsNodes = node.descendantsOfType("throw_statement");
        return throwsNodes.map((throwNode) => throwNode.text);
    }
}
exports.MethodExtractor = MethodExtractor;
//# sourceMappingURL=MethodExtractor.js.map