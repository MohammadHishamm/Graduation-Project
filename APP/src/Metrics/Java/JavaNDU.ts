// import Parser from 'tree-sitter';
// import Java, { name } from 'tree-sitter-java';
// import { ParsedComponents, ClassInfo, MethodInfo, FieldInfo } from '../../Interface/ParsedComponents'; // Import the interface
// import { MetricCalculator } from '../../Core/MetricCalculator';
// import { FileParsedComponents } from '../../Interface/FileParsedComponents';

// export class NDUCalculation extends MetricCalculator {

    
//     calculate(node: any): number 
//     {
//         return this.extractComponents(node.tree);
//     }
    

//     // Extract components and calculate NDU
//     extractComponents(tree: Parser.Tree): number {
//         const rootNode = tree.rootNode;

//         const classes = this.extractClasses(rootNode);
//         const outerClass = classes[0]; // Assume the first class is the outer class
//         const methods = this.extractMethods(rootNode, classes, outerClass);
//         const fields = this.extractFields(rootNode, outerClass);

//         const ndu = this.calculateNDU(methods, fields);

//         return ndu;
        
//     }

//     // Extract only outer class information
//     private extractClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {
//         const classNodes = rootNode.descendantsOfType('class_declaration');
        
//         return classNodes.map((node) => ({
            
//             name: node.childForFieldName('name')?.text ?? 'Unknown',
//             startPosition: node.startPosition,
//             endPosition: node.endPosition,
//             isInInheritance: this.isInInheritance(name),
        
//         }));
//     }

//     // Extract only public methods in the outer class
//     private extractMethods(rootNode: Parser.SyntaxNode, classes: ClassInfo[], outerClass: ClassInfo): MethodInfo[] {
//         const methodNodes = rootNode.descendantsOfType('method_declaration');
//         return methodNodes
//             .map((node) => {
//                 const modifiersNode = node.children.find((child) => child.type === 'modifiers');
//                 const modifiers = modifiersNode ? modifiersNode.text : '';

//                 const name = node.childForFieldName('name')?.text ?? 'Unknown';
//                 const parentClass = this.findParentClass(node, classes);

//                 const isConstructor = parentClass ? parentClass.name === name : false;
//                 const isStatic = modifiers.includes('static');
//                 const isPublic = modifiers.includes('public');

//                 return {
//                     name,
//                     modifiers,
//                     isConstructor,
//                     isAccessor: this.isAccessor(name),
//                     startPosition: node.startPosition,
//                     endPosition: node.endPosition,
//                     isStatic,
//                     isPublic,
//                 };
//             })
//             .filter((method) => method.isPublic && !method.isStatic && this.isInClass(method, outerClass));
//     }

//     // Extract only public fields in the outer class
//     private extractFields(rootNode: Parser.SyntaxNode, outerClass: ClassInfo): FieldInfo[] {
//         const fieldNodes = rootNode.descendantsOfType('field_declaration');
//         return fieldNodes
//             .map((node) => {
//                 const modifiersNode = node.child(0);
//                 const modifiers = modifiersNode ? modifiersNode.text : '';

//                 const nameNode = node.child(2);
//                 const name = nameNode ? nameNode.text : 'Unknown';

//                 return {
//                     name,
//                     modifiers,
//                     startPosition: node.startPosition,
//                     endPosition: node.endPosition,
//                 };
//             })
//             .filter((field) => field.modifiers.includes('public') && this.isInClass(field, outerClass));
//     }

//     // Check if a method or field belongs to the outer class
//     private isInClass(node: MethodInfo | FieldInfo, outerClass: ClassInfo): boolean {
//         return (
//             node.startPosition.row >= outerClass.startPosition.row &&
//             node.endPosition.row <= outerClass.endPosition.row
//         );
//     }

//     // Calculate the NDU metric
//     private calculateNDU(methods: MethodInfo[], fields: FieldInfo[]): number {
//         const numerator = fields.length; // Public fields
//         const denominator = numerator + methods.length; // Total public elements
//         return denominator === 0 ? 0 : numerator / denominator;
//     }

//     // Check if a method is an accessor (getter or setter)
//     public isAccessor(methodName: string): boolean {
//         // Check for getter or setter patterns (case-insensitive)
//         const isGetter = /^get[A-Za-z]/.test(methodName);
//         const isSetter = /^set[A-Za-z]/.test(methodName);
    
//         return isGetter || isSetter;
//     }

//     // Find the parent class for a given node
//     private findParentClass(node: Parser.SyntaxNode, classes: ClassInfo[]): ClassInfo | null {
//         for (const cls of classes) {
//             if (
//                 node.startPosition.row >= cls.startPosition.row &&
//                 node.endPosition.row <= cls.endPosition.row
//             ) {
//                 return cls;
//             }
//         }
//         return null;
//     }
//     private isInInheritance(className: string): boolean {
//         // Logic to determine if the class has an extends or implements relationship
//         // This is a simplified approach, adjust based on the actual AST of the Java code
//         const inheritancePattern = /extends|implements/;
//         return inheritancePattern.test(className);  // A basic placeholder for inheritance check
//     }
// }