"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaAccessofImportData = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const ExtractComponentsFromCode_1 = require("../../Extractors/ExtractComponentsFromCode");
const FolderExtractComponentsFromCode_1 = require("../../Extractors/FolderExtractComponentsFromCode");
class JavaAccessofImportData extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode, FECFC) {
        const extractcomponentsfromcode = new ExtractComponentsFromCode_1.ExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const methods = extractcomponentsfromcode.extractMethods(node, Classes);
        const Fields = extractcomponentsfromcode.extractFields(node, Classes);
        const FDP = this.calculateFDP(node, Classes, methods, Fields, FECFC);
        return FDP;
    }
    calculateFDP(rootNode, currentClasses, methods, fields, FECFC) {
        // Track unique foreign classes accessed
        const foreignClassesAccessed = new Set();
        // Check each method for foreign data access
        methods.forEach((method) => {
            // Find the method's node in the syntax tree
            const methodNode = this.findMethodNodeByPosition(rootNode, method);
            if (!methodNode) {
                return;
            }
            // Get all fields from current class and its ancestors
            const currentClassFields = this.getClassAndAncestorFields(method, currentClasses, fields);
            // Extract references within the method
            const references = this.extractReferencesFromMethod(methodNode, FECFC);
            references.forEach((reference) => {
                // Skip if reference is a local class field
                if (currentClassFields.includes(reference.name)) {
                    return;
                }
                // Determine the class of the referenced entity
                const referenceClass = this.findReferenceOwnerClass(reference, currentClasses);
                // Check if the reference is from a different class and not an ancestor
                if (referenceClass &&
                    !this.isLocalClassAccess(referenceClass, currentClasses)) {
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
    findMethodNodeByPosition(rootNode, method) {
        const findMethodNode = (node) => {
            // Check if the node is a method declaration and matches the position
            if (node.type === "method_declaration" &&
                this.isNodePositionMatch(node, method.startPosition, method.endPosition)) {
                return node;
            }
            // Recursively search child nodes
            for (let child of node.children) {
                const foundNode = findMethodNode(child);
                if (foundNode) {
                    return foundNode;
                }
            }
            return null;
        };
        return findMethodNode(rootNode);
    }
    isNodePositionMatch(node, startPos, endPos) {
        const nodeStart = node.startPosition;
        const nodeEnd = node.endPosition;
        return (nodeStart.row === startPos.row &&
            nodeStart.column === startPos.column &&
            nodeEnd.row === endPos.row &&
            nodeEnd.column === endPos.column);
    }
    /**
     * Get fields from the current class and its ancestors
     */
    getClassAndAncestorFields(method, classes, fields) {
        // Find the class containing the method
        const containingClass = classes.find((cls) => method.startPosition.row >= cls.startPosition.row &&
            method.endPosition.row <= cls.endPosition.row);
        if (!containingClass) {
            return [];
        }
        // Collect fields from the current class and its ancestors
        const classFields = fields
            .filter((field) => field.startPosition.row >= containingClass.startPosition.row &&
            field.startPosition.row <= containingClass.endPosition.row)
            .map((field) => field.name);
        // If the class has a parent, also include fields from parent classes
        if (containingClass.parent) {
            const parentClass = classes.find((cls) => cls.name === containingClass.parent);
            if (parentClass) {
                const parentFields = fields
                    .filter((field) => field.startPosition.row >= parentClass.startPosition.row &&
                    field.startPosition.row <= parentClass.endPosition.row)
                    .map((field) => field.name);
                return [...classFields, ...parentFields];
            }
        }
        return classFields;
    }
    /**
     * Extract references from a method node
     */
    extractReferencesFromMethod(methodNode, FECFC) {
        const references = [];
        // Helper function to traverse and find references
        const findReferences = (node) => {
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
            .map((name) => references.find((r) => r.name === name))
            .filter(Boolean);
    }
    /**
     * Determine if a reference is a field or method
     */
    determineReferenceType(node, FECFC) {
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
    findReferenceOwnerClass(reference, currentClasses) {
        const parsedComponents = this.getParsedComponentsFromFolder();
        for (const fileComponents of parsedComponents) {
            for (const classInfo of fileComponents.classes) {
                const matchField = classInfo.fields.some((f) => f.name.split(" ")[0] === reference.name &&
                    reference.type === "field");
                const matchMethod = classInfo.methods.some((m) => m.name === reference.name && reference.type === "method");
                if (matchField || matchMethod) {
                    return {
                        name: classInfo.name,
                        extendedclass: "",
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
    isLocalClassAccess(referenceClass, currentClasses) {
        // Check if the reference class is in the current set of classes
        const isInCurrentClasses = currentClasses.some((cls) => cls.name === referenceClass.name);
        // Check for ancestor relationship
        const hasAncestorRelationship = currentClasses.some((cls) => cls.parent === referenceClass.name);
        return isInCurrentClasses || hasAncestorRelationship;
    }
    getParsedComponentsFromFolder() {
        const folderExtractor = new FolderExtractComponentsFromCode_1.FolderExtractComponentsFromCode();
        return folderExtractor.getParsedComponentsFromFile();
    }
}
exports.JavaAccessofImportData = JavaAccessofImportData;
//# sourceMappingURL=JavaFDP.js.map