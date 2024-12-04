"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BURCalculation = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class BURCalculation extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        return this.extractComponents(node.tree);
    }
    // Extract components and calculate BUR
    extractComponents(tree) {
        const rootNode = tree.rootNode;
        const baseClasses = this.extractBaseClasses(rootNode);
        const protectedMethods = this.extractProtectedMethods(rootNode, baseClasses);
        const protectedAttributes = this.extractProtectedFields(rootNode, baseClasses);
        const usedProtectedMethods = this.extractUsedProtectedMethods(rootNode);
        const usedProtectedAttributes = this.extractUsedProtectedFields(rootNode);
        const overriddenMethods = this.extractOverriddenMethods(rootNode);
        return this.calculateBUR(baseClasses, protectedMethods, protectedAttributes, usedProtectedMethods, usedProtectedAttributes, overriddenMethods);
    }
    // Extract base class information
    extractBaseClasses(rootNode) {
        const baseClassNodes = rootNode.descendantsOfType("base_class");
        return baseClassNodes.map((node) => ({
            name: node.text,
            startPosition: node.startPosition,
            endPosition: node.endPosition,
            isInInheritance: this.isInInheritance(node), // Add the missing property
        }));
    }
    // Extract protected methods from base classes
    extractProtectedMethods(rootNode, baseClasses) {
        const methodNodes = rootNode.descendantsOfType("method_declaration");
        return methodNodes
            .map((node) => {
            const modifiersNode = node.children.find((child) => child.type === "modifiers");
            const modifiers = modifiersNode ? modifiersNode.text : "";
            return {
                name: node.childForFieldName("name")?.text ?? "Unknown",
                modifiers,
                isConstructor: false,
                isAccessor: false,
                isOverridden: false,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        })
            .filter((method) => method.modifiers.includes("protected") && // Access modifiers from the method object
            this.isInBaseClass(method, baseClasses));
    }
    // Extract protected fields from base classes
    extractProtectedFields(rootNode, baseClasses) {
        const fieldNodes = rootNode.descendantsOfType("field_declaration");
        return fieldNodes
            .map((node) => {
            const modifiersNode = node.child(0);
            const modifiers = modifiersNode ? modifiersNode.text : "";
            return {
                name: node.child(2)?.text ?? "Unknown",
                modifiers,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        })
            .filter((field) => field.modifiers.includes("protected") && // Access modifiers from the field object
            this.isInBaseClass(field, baseClasses));
    }
    extractUsedProtectedMethods(rootNode) {
        // Detect used protected methods in derived class
        const usedMethods = [];
        const methodNodes = rootNode.descendantsOfType("method_call");
        methodNodes.forEach((node) => {
            const methodName = node.childForFieldName("name")?.text ?? "";
            if (methodName && methodName.includes("protected")) {
                usedMethods.push(methodName); // Collect used protected method names
            }
        });
        return usedMethods;
    }
    extractUsedProtectedFields(rootNode) {
        // Detect used protected fields in derived class
        const usedFields = [];
        const fieldNodes = rootNode.descendantsOfType("field_access");
        fieldNodes.forEach((node) => {
            const fieldName = node.childForFieldName("name")?.text ?? "";
            if (fieldName && fieldName.includes("protected")) {
                usedFields.push(fieldName); // Collect used protected field names
            }
        });
        return usedFields;
    }
    extractOverriddenMethods(rootNode) {
        const methodNodes = rootNode.descendantsOfType("method_declaration");
        return methodNodes
            .filter((node) => {
            const modifiersNode = node.children.find((child) => child.type === "modifiers");
            return modifiersNode?.text.includes("override");
        })
            .map((node) => node.childForFieldName("name")?.text ?? "Unknown");
    }
    isInBaseClass(node, baseClasses) {
        return baseClasses.some((baseClass) => node.startPosition.row >= baseClass.startPosition.row &&
            node.endPosition.row <= baseClass.endPosition.row);
    }
    // Calculate the BUR metric
    calculateBUR(baseClasses, protectedMethods, protectedAttributes, usedProtectedMethods, usedProtectedAttributes, overriddenMethods) {
        if (baseClasses.length === 0) {
            return 1.0; // No base classes, return 1
        }
        const totalProtected = protectedMethods.length + protectedAttributes.length;
        // If there are fewer than 3 total protected members, return 1 as a safeguard
        if (totalProtected < 3) {
            return 1.0;
        }
        // Calculate the intersections
        const usedProtectedMethodsSet = new Set(usedProtectedMethods);
        const usedProtectedAttributesSet = new Set(usedProtectedAttributes);
        const overriddenMethodsSet = new Set(overriddenMethods);
        // Calculate the intersections as per the formula
        const protectedMethodsSet = new Set(protectedMethods.map((method) => method.name));
        const protectedAttributesSet = new Set(protectedAttributes.map((field) => field.name));
        const usedProtectedMethodsIntersect = [...protectedMethodsSet].filter((method) => usedProtectedMethodsSet.has(method)).length;
        const usedProtectedAttributesIntersect = [...protectedAttributesSet].filter((attribute) => usedProtectedAttributesSet.has(attribute)).length;
        const overriddenMethodsIntersect = [...protectedMethodsSet].filter((method) => overriddenMethodsSet.has(method)).length;
        // Apply the formula
        const totalIntersection = usedProtectedMethodsIntersect +
            usedProtectedAttributesIntersect +
            overriddenMethodsIntersect;
        return totalIntersection / totalProtected;
    }
    isInInheritance(node) {
        // Logic to determine if the class has an inheritance relationship (extends or implements)
        const inheritancePattern = /extends|implements/;
        return inheritancePattern.test(node.text); // You can adjust the logic as needed.
    }
}
exports.BURCalculation = BURCalculation;
//# sourceMappingURL=JavaBUR.js.map