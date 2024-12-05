"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODCalculation = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class NODCalculation extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        return this.calculateNODForFirstClass(node.tree);
    }
    // Calculate NOD for the first class found in the file
    calculateNODForFirstClass(tree) {
        const rootNode = tree.rootNode;
        const classes = this.extractClasses(rootNode);
        if (classes.length === 0) {
            throw new Error("No classes found in the file.");
        }
        const inheritanceMap = this.buildInheritanceMap(classes);
        const firstClass = classes[0]; // Get the first class in the file
        return this.calculateNOD(firstClass.name, inheritanceMap);
    }
    // Extract class information, including inheritance relationships
    extractClasses(rootNode) {
        const classNodes = rootNode.descendantsOfType("class_declaration");
        return classNodes.map((node) => {
            const name = node.childForFieldName("name")?.text ?? "Unknown";
            let parent = undefined;
            const superclassNode = node.childForFieldName("superclass");
            if (superclassNode) {
                parent = superclassNode.text.replace(/^extends\s+/, ""); // Remove "extends"
            }
            const implementsNode = node.children.find((child) => child.type === "implements");
            if (implementsNode) {
                parent = implementsNode.child(0)?.text?.replace(/^implements\s+/, ""); // Remove "implements"
            }
            return {
                name,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
                parent,
            };
        });
    }
    // Build a map of inheritance relationships
    buildInheritanceMap(classes) {
        const inheritanceMap = {};
        classes.forEach((cls) => {
            if (cls.parent) {
                if (!inheritanceMap[cls.parent]) {
                    inheritanceMap[cls.parent] = [];
                }
                inheritanceMap[cls.parent].push(cls.name);
            }
        });
        return inheritanceMap;
    }
    // Calculate NOD for a given class
    calculateNOD(className, inheritanceMap) {
        const descendants = this.getDescendants(className, inheritanceMap, new Set());
        return descendants.size - 1; // Subtract 1 to exclude the class itself
    }
    // Recursive method to find all descendants of a class
    getDescendants(className, inheritanceMap, visited) {
        if (visited.has(className)) {
            // Class already processed, prevent duplicates
            return visited;
        }
        // Mark the current class as visited
        visited.add(className);
        // Retrieve direct descendants from the inheritance map
        const directDescendants = inheritanceMap[className] || [];
        // Recursively find descendants for each direct descendant
        for (const descendant of directDescendants) {
            this.getDescendants(descendant, inheritanceMap, visited);
        }
        return visited;
    }
}
exports.NODCalculation = NODCalculation;
//# sourceMappingURL=JavaNOD.js.map