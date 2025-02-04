"use strict";
// import Parser from "tree-sitter";
// import { MetricCalculator } from "../../Core/MetricCalculator";
// import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
// import { ClassInfo } from "../../Interface/ClassInfo";
// import { FieldInfo } from "../../Interface/FieldInfo";
// import { MethodInfo } from "../../Interface/MethodInfo";
Object.defineProperty(exports, "__esModule", { value: true });
// interface Reference {
//   name: string;
//   type: "field" | "method";
// }
// export class JavaLocalityofAttributeAccess extends MetricCalculator {
//   calculate(node: any,  FECFC: FolderExtractComponentsFromCode, Filename: string): number 
//     { 
//       let allClasses: ClassInfo[] = [];
//       let allMethods: MethodInfo[] = [];
//       let allFields: FieldInfo[] = [];
//       const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
//       if (fileParsedComponents) 
//       {
//         const classGroups = fileParsedComponents.classes;
//         classGroups.forEach((classGroup) => 
//         {
//           allClasses = [...allClasses, ...classGroup.classes];
//           allMethods = [...allMethods, ...classGroup.methods];
//           allFields = [...allFields, ...classGroup.fields];
//         });
//       }
//     const LAA = this.calculateLAA(node, allClasses, allMethods, allFields, FECFC);
//     console.log("[LAA] Final Metric Value:", LAA);
//     return LAA;
//   }
//   private calculateLAA(
//     rootNode: Parser.SyntaxNode,
//     currentClasses: ClassInfo[],
//     methods: MethodInfo[],
//     fields: FieldInfo[],
//     FECFC: FolderExtractComponentsFromCode
//   ): number {
//     let totalAttributeAccesses = 0;
//     let localAttributeAccesses = 0;
//     // Track unique accesses
//     const localAccessSet = new Set<string>();
//     const foreignAccessSet = new Set<string>();
//     console.log("\n[LAA] Starting attribute access analysis...");
//     methods.forEach((method) => {
//       // Skip constructors and accessors
//       if (method.isConstructor) {
//         return;
//       }
//       console.log(`\n[LAA] Analyzing method: ${method.name}`);
//       const methodNode = this.findMethodNodeByPosition(rootNode, method);
//       if (!methodNode) {return;}
//       // Get local fields (including inherited ones)
//       const currentClassFields = this.getClassAndAncestorFields(
//         method,
//         currentClasses,
//         fields
//       );
//       // Extract unique references within the method
//       const references = this.extractReferencesFromMethod(methodNode, FECFC);
//       references.forEach((reference) => {
//         if (reference.type === "field") {
//           if (currentClassFields.includes(reference.name)) {
//             localAccessSet.add(reference.name);
//           } else {
//             foreignAccessSet.add(reference.name);
//           }
//         }
//       });
//     });
//     // Calculate totals based on unique accesses
//     localAttributeAccesses = localAccessSet.size;
//     totalAttributeAccesses = localAccessSet.size + foreignAccessSet.size;
//     // Log detailed statistics
//     console.log("\n[LAA] Local Attributes Accessed:");
//     if (localAccessSet.size === 0) {
//       console.log("No local attributes accessed");
//     } else {
//       Array.from(localAccessSet)
//         .sort()
//         .forEach((name) => {
//           console.log(`${name}`);
//         });
//     }
//     console.log("\n[LAA] Foreign Attributes Accessed:");
//     if (foreignAccessSet.size === 0) {
//       console.log("No foreign attributes accessed");
//     } else {
//       Array.from(foreignAccessSet)
//         .sort()
//         .forEach((name) => {
//           console.log(`${name}`);
//         });
//     }
//     console.log("\n[LAA] Summary:");
//     console.log("Total Unique Attribute Accesses:", totalAttributeAccesses);
//     console.log("Local Unique Attribute Accesses:", localAttributeAccesses);
//     console.log("Foreign Unique Attribute Accesses:", foreignAccessSet.size);
//     // Calculate LAA
//     const laa =
//       totalAttributeAccesses > 0
//         ? localAttributeAccesses / totalAttributeAccesses
//         : 0;
//     return laa;
//   }
//   private findMethodNodeByPosition(
//     rootNode: Parser.SyntaxNode,
//     method: MethodInfo
//   ): Parser.SyntaxNode | null {
//     const findMethodNode = (
//       node: Parser.SyntaxNode
//     ): Parser.SyntaxNode | null => {
//       if (
//         node.type === "method_declaration" &&
//         this.isNodePositionMatch(node, method.startPosition, method.endPosition)
//       ) {
//         return node;
//       }
//       for (let child of node.children) {
//         const foundNode = findMethodNode(child);
//         if (foundNode) {return foundNode;}
//       }
//       return null;
//     };
//     return findMethodNode(rootNode);
//   }
//   private isNodePositionMatch(
//     node: Parser.SyntaxNode,
//     startPos: Parser.Point,
//     endPos: Parser.Point
//   ): boolean {
//     const nodeStart = node.startPosition;
//     const nodeEnd = node.endPosition;
//     return (
//       nodeStart.row === startPos.row &&
//       nodeStart.column === startPos.column &&
//       nodeEnd.row === endPos.row &&
//       nodeEnd.column === endPos.column
//     );
//   }
//   private getClassAndAncestorFields(
//     method: MethodInfo,
//     classes: ClassInfo[],
//     fields: FieldInfo[]
//   ): string[] {
//     const containingClass = classes.find(
//       (cls) =>
//         method.startPosition.row >= cls.startPosition.row &&
//         method.endPosition.row <= cls.endPosition.row
//     );
//     if (!containingClass) {return [];}
//     const classFields = fields
//       .filter(
//         (field) =>
//           field.startPosition.row >= containingClass.startPosition.row &&
//           field.startPosition.row <= containingClass.endPosition.row
//       )
//       .map((field) => field.name);
//     if (containingClass.parent) {
//       const parentClass = classes.find(
//         (cls) => cls.name === containingClass.parent
//       );
//       if (parentClass) {
//         const parentFields = fields
//           .filter(
//             (field) =>
//               field.startPosition.row >= parentClass.startPosition.row &&
//               field.startPosition.row <= parentClass.endPosition.row
//           )
//           .map((field) => field.name);
//         return [...classFields, ...parentFields];
//       }
//     }
//     return classFields;
//   }
//   private extractReferencesFromMethod(
//     methodNode: Parser.SyntaxNode,
//     FECFC: FolderExtractComponentsFromCode
//   ): Reference[] {
//     const references: Reference[] = [];
//     const findReferences = (node: Parser.SyntaxNode) => {
//       // Check for field or method references
//       if (node.type === "identifier") {
//         // You might want to add more sophisticated checks here
//         references.push({
//           name: node.text,
//           type: this.determineReferenceType(node, FECFC),
//         });
//       }
//       // Recursively search child nodes
//       for (let child of node.children) {
//         findReferences(child);
//       }
//     };
//     findReferences(methodNode);
//     // Remove duplicates
//     return Array.from(new Set(references.map((r) => r.name)))
//       .map((name) => references.find((r) => r.name === name)!)
//       .filter(Boolean);
//   }
//   private determineReferenceType(
//     node: Parser.SyntaxNode,
//     FECFC: FolderExtractComponentsFromCode
//   ): "field" | "method" {
//     const parsedComponents = FECFC.getParsedComponentsFromFile();
//     for (const fileComponents of parsedComponents) {
//       for (const classInfo of fileComponents.classes) {
//         // Check if the reference is a field
//         const isField = classInfo.fields.some((f) => f.name === node.text);
//         if (isField) {
//           return "field";
//         }
//         // Check if the reference is a method
//         const isMethod = classInfo.methods.some((m) => m.name === node.text);
//         if (isMethod) {
//           return "method"; // Correctly handle method references here
//         }
//       }
//     }
//     return "field"; // Default to field if cannot determine
//   }
// }
//# sourceMappingURL=JavaLAA.js.map