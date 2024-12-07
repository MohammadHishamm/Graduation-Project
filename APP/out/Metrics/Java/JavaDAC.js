"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaDataAbstractionCoupling = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaDataAbstractionCoupling extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        return this.extractComponents(node.tree);
    }
    // Extract components and calculate ATFD
    extractComponents(tree) {
        const rootNode = tree.rootNode;
        const classes = this.extractClasses(rootNode);
        const fields = this.extractFields(rootNode, classes);
        // Identify foreign field accesses
        const DAC = this.findDataAbstractionCoupling(fields);
        // Return the count of distinct foreign classes
        return DAC;
    }
    extractClasses(rootNode) {
        const classNodes = rootNode.descendantsOfType('class_declaration');
        return classNodes.map((node) => ({
            name: node.childForFieldName('name')?.text ?? 'Unknown',
            startPosition: node.startPosition,
            endPosition: node.endPosition,
        }));
    }
    extractMethods(rootNode, classes) {
        const methodNodes = rootNode.descendantsOfType('method_declaration');
        return methodNodes.map((node) => {
            // Dynamically find modifiers as a child node
            const modifiersNode = node.children.find((child) => child.type === 'modifiers');
            const modifiers = modifiersNode ? modifiersNode.text : '';
            // Check if the method is overridden by looking for '@Override' in the modifiers
            const isOverridden = modifiers.includes('@Override');
            // Remove '@Override' and 'static' from the modifiers to focus on the access modifier only
            let accessModifier = modifiers.replace('@Override', '').replace('static', '').trim();
            // Determine the access modifier
            if (accessModifier.includes('public')) {
                accessModifier = 'public';
            }
            else if (accessModifier.includes('private')) {
                accessModifier = 'private';
            }
            else if (accessModifier.includes('protected')) {
                accessModifier = 'protected';
            }
            else {
                accessModifier = 'public'; // Default to public if no access modifier is found
            }
            const name = node.childForFieldName('name')?.text ?? 'Unknown';
            const params = node.childForFieldName('parameters')?.text ?? '';
            const parentClass = this.findParentClass(node, classes);
            const isConstructor = parentClass ? parentClass.name === name : false;
            const isAccessor = this.isAccessor(name);
            return {
                name,
                modifiers: accessModifier, // Only 'public', 'private', or 'protected' are kept
                isConstructor,
                isAccessor,
                isOverridden, // Add the isOverridden field to the return value
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }
    extractFields(rootNode, classes) {
        // Find all the field declaration nodes in the syntax tree
        const fieldNodes = rootNode.descendantsOfType('field_declaration');
        return fieldNodes.map((node) => {
            // Log node to inspect its children (useful for debugging)
            // console.log('Field Node:', node.toString());
            // The modifiers are usually on the first child (public, private, etc.)
            const modifiersNode = node.child(0); // Use child(0) to access the first child
            const modifiers = modifiersNode ? modifiersNode.text : '';
            // The type of the field (like int, String)
            const typeNode = node.child(1); // Access second child for the type
            const type = typeNode ? typeNode.text : '';
            // The name of the field is usually the third child
            const nameNode = node.child(2); // Access third child for the name
            const name = nameNode ? nameNode.text : 'Unknown';
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
    findDataAbstractionCoupling(Fields) {
        let DAC = 0; // Initialize DAC counter
        const usedClassTypes = new Set(); // To track unique types
        // List of primitive types to ignore
        const primitiveTypes = new Set([
            "int", "float", "double", "boolean", "char", "byte",
            "short", "long", "void", "string"
        ]);
        for (const field of Fields) {
            const fieldType = field.type;
            if (!fieldType) {
                return DAC;
            }
            // Extract generic types if present (e.g., "List<Book>")
            const genericMatch = fieldType.match(/^(\w+)<(.+)>$/);
            if (!genericMatch) {
                if (!primitiveTypes.has(fieldType.toLowerCase()) && !usedClassTypes.has(fieldType)) {
                    usedClassTypes.add(fieldType);
                    DAC++;
                }
            }
        }
        return DAC; // Return the final count
    }
    findParentClass(node, classes) {
        for (const cls of classes) {
            if (node.startPosition.row >= cls.startPosition.row &&
                node.endPosition.row <= cls.endPosition.row) {
                return cls;
            }
        }
        return null;
    }
    isAccessor(methodName) {
        // Check for getter or setter patterns (case-insensitive)
        const isGetter = /^get[A-Za-z]/.test(methodName);
        const isSetter = /^set[A-Za-z]/.test(methodName);
        return isGetter || isSetter;
    }
}
exports.JavaDataAbstractionCoupling = JavaDataAbstractionCoupling;
//# sourceMappingURL=JavaDAC.js.map