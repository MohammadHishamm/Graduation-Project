"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NDUCalculation = void 0;
const tree_sitter_1 = __importDefault(require("tree-sitter"));
const tree_sitter_java_1 = __importStar(require("tree-sitter-java"));
class NDUCalculation {
    parser;
    constructor() {
        this.parser = new tree_sitter_1.default();
        this.parser.setLanguage(tree_sitter_java_1.default); // Initialize Tree-sitter for Java
    }
    // Parses the given code and returns a syntax tree
    parseCode(code) {
        return this.parser.parse(code);
    }
    // Extract components and calculate NDU
    extractComponents(tree) {
        const rootNode = tree.rootNode;
        const classes = this.extractClasses(rootNode);
        const outerClass = classes[0]; // Assume the first class is the outer class
        const methods = this.extractMethods(rootNode, classes, outerClass);
        const fields = this.extractFields(rootNode, outerClass);
        const ndu = this.calculateNDU(methods, fields);
        return {
            classes,
            methods,
            fields,
            weight: ndu,
        };
    }
    // Extract only outer class information
    extractClasses(rootNode) {
        const classNodes = rootNode.descendantsOfType('class_declaration');
        return classNodes.map((node) => ({
            name: node.childForFieldName('name')?.text ?? 'Unknown',
            startPosition: node.startPosition,
            endPosition: node.endPosition,
            isInInheritance: this.isInInheritance(tree_sitter_java_1.name),
        }));
    }
    // Extract only public methods in the outer class
    extractMethods(rootNode, classes, outerClass) {
        const methodNodes = rootNode.descendantsOfType('method_declaration');
        return methodNodes
            .map((node) => {
            const modifiersNode = node.children.find((child) => child.type === 'modifiers');
            const modifiers = modifiersNode ? modifiersNode.text : '';
            const name = node.childForFieldName('name')?.text ?? 'Unknown';
            const parentClass = this.findParentClass(node, classes);
            const isConstructor = parentClass ? parentClass.name === name : false;
            const isStatic = modifiers.includes('static');
            const isPublic = modifiers.includes('public');
            return {
                name,
                modifiers,
                isConstructor,
                isAccessor: this.isAccessor(name),
                startPosition: node.startPosition,
                endPosition: node.endPosition,
                isStatic,
                isPublic,
            };
        })
            .filter((method) => method.isPublic && !method.isStatic && this.isInClass(method, outerClass));
    }
    // Extract only public fields in the outer class
    extractFields(rootNode, outerClass) {
        const fieldNodes = rootNode.descendantsOfType('field_declaration');
        return fieldNodes
            .map((node) => {
            const modifiersNode = node.child(0);
            const modifiers = modifiersNode ? modifiersNode.text : '';
            const nameNode = node.child(2);
            const name = nameNode ? nameNode.text : 'Unknown';
            return {
                name,
                modifiers,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        })
            .filter((field) => field.modifiers.includes('public') && this.isInClass(field, outerClass));
    }
    // Check if a method or field belongs to the outer class
    isInClass(node, outerClass) {
        return (node.startPosition.row >= outerClass.startPosition.row &&
            node.endPosition.row <= outerClass.endPosition.row);
    }
    // Calculate the NDU metric
    calculateNDU(methods, fields) {
        const numerator = fields.length; // Public fields
        const denominator = numerator + methods.length; // Total public elements
        return denominator === 0 ? 0 : numerator / denominator;
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
    isInInheritance(className) {
        // Logic to determine if the class has an extends or implements relationship
        // This is a simplified approach, adjust based on the actual AST of the Java code
        const inheritancePattern = /extends|implements/;
        return inheritancePattern.test(className); // A basic placeholder for inheritance check
    }
}
exports.NDUCalculation = NDUCalculation;
//# sourceMappingURL=JavaNDU.js.map