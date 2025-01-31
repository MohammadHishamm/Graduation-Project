"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassExtractor = void 0;
class ClassExtractor {
    // Main function to extract all classes
    extractClasses(rootNode) {
        const classNodes = rootNode.descendantsOfType("class_declaration");
        const { extendedClass, implementedInterfaces } = this.extractInheritanceInfo(classNodes);
        const classInfos = this.extractClassInfo(classNodes, extendedClass, implementedInterfaces);
        return classInfos;
    }
    // Function to extract inheritance information (extends and implements)
    extractInheritanceInfo(classNodes) {
        let extendedClass;
        let implementedInterfaces = [];
        classNodes.forEach((node) => {
            const extendsNode = node.childForFieldName("superclass");
            const implementsNode = node.childForFieldName("interfaces");
            if (extendsNode) {
                extendedClass = extendsNode.text.trim().replace(/^(extends|implements)\s*/, "");
            }
            if (implementsNode) {
                implementedInterfaces = implementsNode.text.split(",").map((i) => i.trim());
            }
        });
        return { extendedClass, implementedInterfaces };
    }
    // Function to extract all class information
    extractClassInfo(classNodes, extendedClass, implementedInterfaces) {
        return classNodes.map((node) => {
            const modifiers = this.extractModifiers(node);
            const annotations = this.extractAnnotations(node);
            const isNested = this.isNestedClass(node);
            const genericParams = this.extractGenericParams(node);
            const hasConstructor = this.hasConstructor(node);
            const bodyNode = node.childForFieldName("body");
            return {
                name: node.childForFieldName("name")?.text ?? "Unknown",
                implementedInterfaces,
                isAbstract: modifiers.includes("abstract"),
                isFinal: modifiers.includes("final"),
                isInterface: node.type === "interface_declaration",
                modifiers,
                annotations,
                startPosition: bodyNode?.startPosition ?? node.startPosition,
                endPosition: bodyNode?.endPosition ?? node.endPosition,
                parent: extendedClass,
                isNested,
                genericParams,
                hasConstructor,
            };
        });
    }
    // Function to extract modifiers from the class
    extractModifiers(node) {
        return node.children
            .filter((child) => child.type === "modifier")
            .map((child) => child.text);
    }
    // Function to extract annotations from the class
    extractAnnotations(node) {
        return node.children
            .filter((child) => child.type === "annotation")
            .map((child) => child.text);
    }
    // Function to check if a class is nested
    isNestedClass(node) {
        return node.parent?.type === "class_declaration";
    }
    // Function to extract generic parameters from the class
    extractGenericParams(node) {
        const genericParamsNode = node.childForFieldName("type_parameters");
        return genericParamsNode ? genericParamsNode.text : undefined;
    }
    // Function to check if the class has a constructor
    hasConstructor(node) {
        const bodyNode = node.childForFieldName("body");
        if (bodyNode) {
            if (bodyNode.descendantsOfType("constructor_declaration").length > 0) {
                return true;
            }
        }
        return false;
    }
}
exports.ClassExtractor = ClassExtractor;
//# sourceMappingURL=ClassExtractor.js.map