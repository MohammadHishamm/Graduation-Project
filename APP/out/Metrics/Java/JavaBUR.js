"use strict";
// import Parser from "tree-sitter";
// import {
//   ParsedComponents,
//   ClassInfo,
//   MethodInfo,
//   FieldInfo,
// } from "../../Interface/ParsedComponentsNDU";
// import { MetricCalculator } from "../../Core/MetricCalculator";
// import { FileParsedComponents } from "../../Interface/FileParsedComponents";
Object.defineProperty(exports, "__esModule", { value: true });
// export class BURCalculation extends MetricCalculator {
//   calculate(node: any): number {
//     return this.extractComponents(node.tree);
//   }
//   // Extract components and calculate BUR
//   extractComponents(tree: Parser.Tree): number {
//     const rootNode = tree.rootNode;
//     const baseClasses = this.extractBaseClasses(rootNode);
//     const protectedMethods = this.extractProtectedMethods(
//       rootNode,
//       baseClasses
//     );
//     const protectedAttributes = this.extractProtectedFields(
//       rootNode,
//       baseClasses
//     );
//     const usedProtectedMethods = this.extractUsedProtectedMethods(rootNode);
//     const usedProtectedAttributes = this.extractUsedProtectedFields(rootNode);
//     const overriddenMethods = this.extractOverriddenMethods(rootNode);
//     return this.calculateBUR(
//       baseClasses,
//       protectedMethods,
//       protectedAttributes,
//       usedProtectedMethods,
//       usedProtectedAttributes,
//       overriddenMethods
//     );
//   }
//   // Extract base class information
//   private extractBaseClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {
//     const baseClassNodes = rootNode.descendantsOfType("base_class");
//     return baseClassNodes.map((node) => ({
//       name: node.text,
//       startPosition: node.startPosition,
//       endPosition: node.endPosition,
//       isInInheritance: this.isInInheritance(node), // Add the missing property
//     }));
//   }
//   // Extract protected methods from base classes
//   private extractProtectedMethods(
//     rootNode: Parser.SyntaxNode,
//     baseClasses: ClassInfo[]
//   ): MethodInfo[] {
//     const methodNodes = rootNode.descendantsOfType("method_declaration");
//     return methodNodes
//       .map((node) => {
//         const modifiersNode = node.children.find(
//           (child) => child.type === "modifiers"
//         );
//         const modifiers = modifiersNode ? modifiersNode.text : "";
//         return {
//           name: node.childForFieldName("name")?.text ?? "Unknown",
//           modifiers,
//           isConstructor: false,
//           isAccessor: false,
//           isOverridden: false,
//           startPosition: node.startPosition,
//           endPosition: node.endPosition,
//         };
//       })
//       .filter(
//         (method) =>
//           method.modifiers.includes("protected") && // Access modifiers from the method object
//           this.isInBaseClass(method, baseClasses)
//       );
//   }
//   // Extract protected fields from base classes
//   private extractProtectedFields(
//     rootNode: Parser.SyntaxNode,
//     baseClasses: ClassInfo[]
//   ): FieldInfo[] {
//     const fieldNodes = rootNode.descendantsOfType("field_declaration");
//     return fieldNodes
//       .map((node) => {
//         const modifiersNode = node.child(0);
//         const modifiers = modifiersNode ? modifiersNode.text : "";
//         return {
//           name: node.child(2)?.text ?? "Unknown",
//           modifiers,
//           startPosition: node.startPosition,
//           endPosition: node.endPosition,
//         };
//       })
//       .filter(
//         (field) =>
//           field.modifiers.includes("protected") && // Access modifiers from the field object
//           this.isInBaseClass(field, baseClasses)
//       );
//   }
//   private extractUsedProtectedMethods(rootNode: Parser.SyntaxNode): string[] {
//     // Detect used protected methods in derived class
//     const usedMethods: string[] = [];
//     const methodNodes = rootNode.descendantsOfType("method_call");
//     methodNodes.forEach((node) => {
//       const methodName = node.childForFieldName("name")?.text ?? "";
//       if (methodName && methodName.includes("protected")) {
//         usedMethods.push(methodName); // Collect used protected method names
//       }
//     });
//     return usedMethods;
//   }
//   private extractUsedProtectedFields(rootNode: Parser.SyntaxNode): string[] {
//     // Detect used protected fields in derived class
//     const usedFields: string[] = [];
//     const fieldNodes = rootNode.descendantsOfType("field_access");
//     fieldNodes.forEach((node) => {
//       const fieldName = node.childForFieldName("name")?.text ?? "";
//       if (fieldName && fieldName.includes("protected")) {
//         usedFields.push(fieldName); // Collect used protected field names
//       }
//     });
//     return usedFields;
//   }
//   private extractOverriddenMethods(rootNode: Parser.SyntaxNode): string[] {
//     const methodNodes = rootNode.descendantsOfType("method_declaration");
//     return methodNodes
//       .filter((node) => {
//         const modifiersNode = node.children.find(
//           (child) => child.type === "modifiers"
//         );
//         return modifiersNode?.text.includes("override");
//       })
//       .map((node) => node.childForFieldName("name")?.text ?? "Unknown");
//   }
//   private isInBaseClass(
//     node: MethodInfo | FieldInfo,
//     baseClasses: ClassInfo[]
//   ): boolean {
//     return baseClasses.some(
//       (baseClass) =>
//         node.startPosition.row >= baseClass.startPosition.row &&
//         node.endPosition.row <= baseClass.endPosition.row
//     );
//   }
//   // Calculate the BUR metric
//   private calculateBUR(
//     baseClasses: ClassInfo[],
//     protectedMethods: MethodInfo[],
//     protectedAttributes: FieldInfo[],
//     usedProtectedMethods: string[],
//     usedProtectedAttributes: string[],
//     overriddenMethods: string[]
//   ): number {
//     if (baseClasses.length === 0) {
//       return 1.0; // No base classes, return 1
//     }
//     const totalProtected = protectedMethods.length + protectedAttributes.length;
//     // If there are fewer than 3 total protected members, return 1 as a safeguard
//     if (totalProtected < 3) {
//       return 1.0;
//     }
//     // Calculate the intersections
//     const usedProtectedMethodsSet = new Set(usedProtectedMethods);
//     const usedProtectedAttributesSet = new Set(usedProtectedAttributes);
//     const overriddenMethodsSet = new Set(overriddenMethods);
//     // Calculate the intersections as per the formula
//     const protectedMethodsSet = new Set(
//       protectedMethods.map((method) => method.name)
//     );
//     const protectedAttributesSet = new Set(
//       protectedAttributes.map((field) => field.name)
//     );
//     const usedProtectedMethodsIntersect = [...protectedMethodsSet].filter(
//       (method) => usedProtectedMethodsSet.has(method)
//     ).length;
//     const usedProtectedAttributesIntersect = [...protectedAttributesSet].filter(
//       (attribute) => usedProtectedAttributesSet.has(attribute)
//     ).length;
//     const overriddenMethodsIntersect = [...protectedMethodsSet].filter(
//       (method) => overriddenMethodsSet.has(method)
//     ).length;
//     // Apply the formula
//     const totalIntersection =
//       usedProtectedMethodsIntersect +
//       usedProtectedAttributesIntersect +
//       overriddenMethodsIntersect;
//     return totalIntersection / totalProtected;
//   }
//   private isInInheritance(node: Parser.SyntaxNode): boolean {
//     // Logic to determine if the class has an inheritance relationship (extends or implements)
//     const inheritancePattern = /extends|implements/;
//     return inheritancePattern.test(node.text); // You can adjust the logic as needed.
//   }
// }
//# sourceMappingURL=JavaBUR.js.map