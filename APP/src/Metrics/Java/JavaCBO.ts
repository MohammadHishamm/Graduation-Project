
import Parser from "tree-sitter";
import { MetricCalculator } from "../../Core/MetricCalculator";

import { ClassInfo } from "../../Interface/ClassInfo";
import { MethodInfo } from "../../Interface/MethodInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";



export class JavaCouplingBetweenObjects extends MetricCalculator {
    calculate(node: any, sourceCode: string, FECFC: FolderExtractComponentsFromCode, Filename: string): number 
    { 
      let allClasses: ClassInfo[] = [];
      let allMethods: MethodInfo[] = [];
      let allFields: FieldInfo[] = [];
  
      const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
  
      if (fileParsedComponents) 
      {
        const classGroups = fileParsedComponents.classes;
        classGroups.forEach((classGroup) => 
        {
          allClasses = [...allClasses, ...classGroup.classes];
          allMethods = [...allMethods, ...classGroup.methods];
          allFields = [...allFields, ...classGroup.fields];
        });
      }

    let totalCBO =0;
    
    
    totalCBO += this.parameter_TypesCount(allMethods, node) + this.accessTypesCount(allFields) +  this.callTypesCount(allMethods,node) ;

   
    

    return totalCBO;
  }

  private parameter_TypesCount(
    methods: MethodInfo[],
    node: Parser.SyntaxNode
  ): number {
    const methodNodes = node.descendantsOfType("method_declaration");
    let total = 0;
  
    const primitiveTypes = new Set([
      "int",
      "float",
      "double",
      "boolean",
      "char",
      "byte",
      "short",
      "long",
      "void",
      "string",
    ]);
  
    const uniqueParamTypes = new Set<string>(); // Use a Set to store unique type identifiers
    const classReturnTypes = new Set<string>(); // Set to track class return types
  
    methodNodes.forEach((methodNode) => {
      const returnTypeNode = methodNode.childForFieldName("return_type");
      const paramsNode = methodNode.childForFieldName("parameters");
  
      // Check return type for class (non-primitive)
      if (returnTypeNode && returnTypeNode.type === "type_identifier") {
        const returnType = returnTypeNode.text ?? "Unknown Type";
        if (!primitiveTypes.has(returnType.toLowerCase())) {
          classReturnTypes.add(returnType); // Add to set if it's not a primitive type
        }
      }
  
      if (paramsNode) {
        paramsNode.children.forEach((paramNode) => {
          if (paramNode.type === "formal_parameter") {
            const typeNode = paramNode.childForFieldName("type");
            if (typeNode && typeNode.type === "type_identifier") {
              const paramType = typeNode.text ?? "Unknown Type";
  
              // Only add if it's NOT a primitive type
              if (!primitiveTypes.has(paramType.toLowerCase())) {
                uniqueParamTypes.add(paramType);
              }
            }
          }
        });
      }
    });
  
    // Combine the return values and unique parameter types
    total = classReturnTypes.size + uniqueParamTypes.size;
  
    return total;
  }
  
  


  private accessTypesCount(Fields: FieldInfo[]): number {
    let CBO = 0; // Initialize DAC counter
    const usedClassTypes = new Set<string>(); // To track unique types

    // List of primitive types to ignore
    const primitiveTypes = new Set([
      "int",
      "float",
      "double",
      "boolean",
      "char",
      "byte",
      "short",
      "long",
      "void",
      "string",
    ]);

    for (const field of Fields) {
      const fieldType = field.type;

      if (!fieldType) {
        return CBO;
      }

      // Extract generic types if present (e.g., "List<Book>")
      const genericMatch = fieldType.match(/^(\w+)<(.+)>$/);
      if (!genericMatch) {
        if (
          !primitiveTypes.has(fieldType.toLowerCase()) &&
          !usedClassTypes.has(fieldType)
        ) {
          usedClassTypes.add(fieldType);
          CBO++;
        }
      }
    }

    return CBO; // Return the final count
  }
  

  private callTypesCount(methods: MethodInfo[], node: Parser.SyntaxNode): number {
    const uniqueCalledClasses = new Set<string>(); // Store unique class calls
    const primitiveTypes = new Set([
        "int", "float", "double", "boolean", "char", 
        "byte", "short", "long", "void", "string"
    ]);

    const methodNodes = node.descendantsOfType("method_declaration");

    methodNodes.forEach((method) => {
        const methodName = method.childForFieldName("name")?.text ?? "Unknown";
        console.log(`Checking method: ${methodName}`);

        // Find method calls inside the method
        const callNodes = method.descendantsOfType("method_invocation");

        callNodes.forEach((callNode) => {
            const calledObject = callNode.childForFieldName("object");
            const calledMethod = callNode.childForFieldName("name")?.text ?? "Unknown";

            if (calledObject && calledObject.type === "identifier") {
                const classCall = calledObject.text;
                
                // Only add non-primitive types
                if (!primitiveTypes.has(classCall.toLowerCase())) {
                    uniqueCalledClasses.add(classCall);
                }

                console.log(`- Method "${methodName}" calls "${calledMethod}" on "${classCall}"`);
            }
        });
    });

    // Convert Set to an Array
    const uniqueClassCallsArray = Array.from(uniqueCalledClasses);
    console.log("Unique Called Classes:", uniqueClassCallsArray);

    return uniqueCalledClasses.size;
}

}