// import Parser from "tree-sitter";

// import { MetricCalculator } from "../../Core/MetricCalculator";
// import { ClassInfo } from "../../Interface/ClassInfo";
// import { MethodInfo } from "../../Interface/MethodInfo";
// import { FieldInfo } from "../../Interface/FieldInfo";

// import { FileParsedComponents } from "../../Interface/FileParsedComponents";

// export class JavaBaseclassOverwritingMethods extends MetricCalculator {

  
//   calculate(node: any): number {
//     return this.extractComponents(node.tree);
//   }

//   extractComponents(tree: Parser.Tree): number {
//     const rootNode = tree.rootNode;

//     const classes = this.extractClasses(rootNode);
//     const methods = this.extractMethods(rootNode, classes);

//     const baseClassMethods = this.extractBaseClassMethods(rootNode, classes);
//     const nonAbstractBaseMethods =
//       this.filterNonAbstractMethods(baseClassMethods);

//     const overriddenMethods = this.filterOverriddenMethods(
//       methods,
//       nonAbstractBaseMethods
//     );
//     const bovm = this.calculateBOvM(overriddenMethods);

//     console.log("Classes Found:", classes);
//     console.log("Methods Found:", methods);
//     console.log("Base Class Methods:", baseClassMethods);
//     console.log("Non-Abstract Base Methods:", nonAbstractBaseMethods);
//     console.log("Overridden Methods:", overriddenMethods);
//     console.log("BOvM:", bovm);

//     return bovm;
//   }

//   private extractClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {
//     const classNodes = rootNode.descendantsOfType("class_declaration");
//     return classNodes.map((node) => ({
//       name: node.childForFieldName("name")?.text ?? "Unknown",
//       startPosition: node.startPosition,
//       endPosition: node.endPosition,
//     }));
//   }

//   private extractMethods(
//     rootNode: Parser.SyntaxNode,
//     classes: ClassInfo[]
//   ): MethodInfo[] {
//     const methodNodes = rootNode.descendantsOfType("method_declaration");
//     return methodNodes.map((node) => {
//       const modifiersNode = node.children.find(
//         (child) => child.type === "modifiers"
//       );
//       const modifiers = modifiersNode ? modifiersNode.text : "";
//       const isOverridden = modifiers.includes("@Override");
//       const accessModifier = this.extractAccessModifier(modifiers);

//       const name = node.childForFieldName("name")?.text ?? "Unknown";
//       const parentClass = this.findParentClass(node, classes);

//       const isConstructor = parentClass ? parentClass.name === name : false;

//       return {
//         name,
//         modifiers: accessModifier,
//         isConstructor,
//         isAccessor: this.isAccessor(name),
//         isOverridden,
//         startPosition: node.startPosition,
//         endPosition: node.endPosition,
//       };
//     });
//   }

//   private extractBaseClassMethods(
//     rootNode: Parser.SyntaxNode,
//     classes: ClassInfo[]
//   ): MethodInfo[] {
//     const baseClassNodes = rootNode.descendantsOfType("base_class_declaration"); // Example node type for base classes
//     const methods: MethodInfo[] = [];

//     baseClassNodes.forEach((baseClassNode) => {
//       const methodNodes = baseClassNode.descendantsOfType("method_declaration");
//       methods.push(
//         ...methodNodes.map((node) => {
//           const modifiersNode = node.children.find(
//             (child) => child.type === "modifiers"
//           );
//           const modifiers = modifiersNode ? modifiersNode.text : "";
//           return {
//             name: node.childForFieldName("name")?.text ?? "Unknown",
//             modifiers,
//             isConstructor: false,
//             isAccessor: false,
//             isOverridden: false,
//             startPosition: node.startPosition,
//             endPosition: node.endPosition,
//           };
//         })
//       );
//     });

//     return methods;
//   }

//   private filterNonAbstractMethods(methods: MethodInfo[]): MethodInfo[] {
//     return methods.filter((method) => !method.modifiers.includes("abstract"));
//   }

//   private filterOverriddenMethods(
//     subclassMethods: MethodInfo[],
//     baseClassMethods: MethodInfo[]
//   ): MethodInfo[] {
//     const baseMethodNames = new Set(
//       baseClassMethods.map((method) => method.name)
//     );

//     return subclassMethods.filter(
//       (method) =>
//         method.isOverridden &&
//         baseMethodNames.has(method.name) &&
//         !method.isConstructor &&
//         !method.isAccessor
//     );
//   }

//   private calculateBOvM(overriddenMethods: MethodInfo[]): number {
//     const distinctMethods = new Set(
//       overriddenMethods.map((method) => method.name)
//     );
//     return distinctMethods.size;
//   }

//   private findParentClass(
//     node: Parser.SyntaxNode,
//     classes: ClassInfo[]
//   ): ClassInfo | null {
//     for (const cls of classes) {
//       if (
//         node.startPosition.row >= cls.startPosition.row &&
//         node.endPosition.row <= cls.endPosition.row
//       ) {
//         return cls;
//       }
//     }
//     return null;
//   }

//   private extractAccessModifier(modifiers: string): string {
//     if (modifiers.includes("public")) {return "public";}
//     if (modifiers.includes("private")) {return "private";}
//     if (modifiers.includes("protected")) {return "protected";}
//     return "public"; // Default
//   }

//   private isAccessor(methodName: string): boolean {
//     return /^get[A-Z]/.test(methodName) || /^set[A-Z]/.test(methodName);
//   }
// }
