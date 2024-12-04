"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaBaseclassOverwritingMethods = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaBaseclassOverwritingMethods extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        return this.extractComponents(node.tree);
    }
    extractComponents(tree) {
        const rootNode = tree.rootNode;
        const classes = this.extractClasses(rootNode);
        const methods = this.extractMethods(rootNode, classes);
        const baseClassMethods = this.extractBaseClassMethods(rootNode, classes);
        const nonAbstractBaseMethods = this.filterNonAbstractMethods(baseClassMethods);
        const overriddenMethods = this.filterOverriddenMethods(methods, nonAbstractBaseMethods);
        const bovm = this.calculateBOvM(overriddenMethods);
        console.log("Classes Found:", classes);
        console.log("Methods Found:", methods);
        console.log("Base Class Methods:", baseClassMethods);
        console.log("Non-Abstract Base Methods:", nonAbstractBaseMethods);
        console.log("Overridden Methods:", overriddenMethods);
        console.log("BOvM:", bovm);
        return bovm;
    }
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
            const modifiersNode = node.children.find((child) => child.type === "modifiers");
            const modifiers = modifiersNode ? modifiersNode.text : "";
            const isOverridden = modifiers.includes("@Override");
            const accessModifier = this.extractAccessModifier(modifiers);
            const name = node.childForFieldName("name")?.text ?? "Unknown";
            const parentClass = this.findParentClass(node, classes);
            const isConstructor = parentClass ? parentClass.name === name : false;
            return {
                name,
                modifiers: accessModifier,
                isConstructor,
                isAccessor: this.isAccessor(name),
                isOverridden,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }
    extractBaseClassMethods(rootNode, classes) {
        const baseClassNodes = rootNode.descendantsOfType("base_class_declaration"); // Example node type for base classes
        const methods = [];
        baseClassNodes.forEach((baseClassNode) => {
            const methodNodes = baseClassNode.descendantsOfType("method_declaration");
            methods.push(...methodNodes.map((node) => {
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
            }));
        });
        return methods;
    }
    filterNonAbstractMethods(methods) {
        return methods.filter((method) => !method.modifiers.includes("abstract"));
    }
    filterOverriddenMethods(subclassMethods, baseClassMethods) {
        const baseMethodNames = new Set(baseClassMethods.map((method) => method.name));
        return subclassMethods.filter((method) => method.isOverridden &&
            baseMethodNames.has(method.name) &&
            !method.isConstructor &&
            !method.isAccessor);
    }
    calculateBOvM(overriddenMethods) {
        const distinctMethods = new Set(overriddenMethods.map((method) => method.name));
        return distinctMethods.size;
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
    extractAccessModifier(modifiers) {
        if (modifiers.includes("public"))
            return "public";
        if (modifiers.includes("private"))
            return "private";
        if (modifiers.includes("protected"))
            return "protected";
        return "public"; // Default
    }
    isAccessor(methodName) {
        return /^get[A-Z]/.test(methodName) || /^set[A-Z]/.test(methodName);
    }
}
exports.JavaBaseclassOverwritingMethods = JavaBaseclassOverwritingMethods;
//# sourceMappingURL=JavaBoVM.js.map