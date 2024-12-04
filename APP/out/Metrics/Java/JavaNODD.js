"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NODDCalculation = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class NODDCalculation extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        return this.calculateNODDForFirstClass(node.tree);
    }
    // Calculate NODD for the first class found in the file
    calculateNODDForFirstClass(tree) {
        const rootNode = tree.rootNode;
        const classes = this.extractClasses(rootNode);
        if (classes.length === 0) {
            throw new Error("No classes found in the file.");
        }
        const inheritanceMap = this.buildInheritanceMap(classes);
        const firstClass = classes[0]; // Get the first class in the file
        return this.calculateNODD(firstClass.name, inheritanceMap);
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
    // Calculate NODD for a given class
    calculateNODD(className, inheritanceMap) {
        const directDescendants = inheritanceMap[className] || [];
        return directDescendants.length; // Return count of direct descendants
    }
}
exports.NODDCalculation = NODDCalculation;
//# sourceMappingURL=JavaNODD.js.map