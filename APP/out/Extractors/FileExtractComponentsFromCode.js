"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileExtractComponentsFromCode = void 0;
class FileExtractComponentsFromCode {
    extractClasses(rootNode) {
        const classNodes = rootNode.descendantsOfType("class_declaration");
        return classNodes.map((node) => ({
            name: node.childForFieldName("name")?.text ?? "Unknown",
            startPosition: node.startPosition,
            endPosition: node.endPosition,
        }));
    }
    extractMethods(rootNode, classes) {
        const methodNodes = rootNode.descendantsOfType("method_declaration");
        return methodNodes.map((node) => {
            // Dynamically find modifiers as a child node
            const modifiersNode = node.children.find((child) => child.type === "modifiers");
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
    extractFieldsUsedInMethod(node) {
        const fieldsUsed = [];
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
    isAccessor(methodName) {
        return /^get[A-Z]/.test(methodName) || /^set[A-Z]/.test(methodName);
    }
    // Find the parent class for a given node
    findParentClass(node, classes) {
        for (const cls of classes) {
            if (node.startPosition.row >= cls.startPosition.row &&
                node.endPosition.row <= cls.endPosition.row) {
                return cls;
            }
        }
        return null;
    }
    // Calculate TCC based on methods and fields
    extractFields(rootNode, classes) {
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
    getFieldsUsedInMethod(rootNode, method) {
        const fieldsUsed = [];
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
    filterPublicNonEncapsulatedFields(fields, methods) {
        return fields.filter((field) => field.modifiers.includes("public") &&
            !this.hasGetterSetter(field.name, methods));
    }
    // Check if the field has getter or setter methods
    hasGetterSetter(fieldName, methods) {
        const getterPattern = new RegExp(`get${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}\\(`);
        const setterPattern = new RegExp(`set${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}\\(`);
        return methods.some((method) => getterPattern.test(method.name) || setterPattern.test(method.name));
    }
}
exports.FileExtractComponentsFromCode = FileExtractComponentsFromCode;
//# sourceMappingURL=FileExtractComponentsFromCode.js.map