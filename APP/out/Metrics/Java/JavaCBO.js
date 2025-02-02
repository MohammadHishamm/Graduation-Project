"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaCouplingBetweenObjects = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaCouplingBetweenObjects extends MetricCalculator_1.MetricCalculator {
    calculate(node, FECFC, Filename) {
        let allClasses = [];
        let allMethods = [];
        let allFields = [];
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
        if (fileParsedComponents) {
            const classGroups = fileParsedComponents.classes;
            classGroups.forEach((classGroup) => {
                allClasses = [...allClasses, ...classGroup.classes];
                allMethods = [...allMethods, ...classGroup.methods];
                allFields = [...allFields, ...classGroup.fields];
            });
        }
        let totalCBO = 0;
        totalCBO += this.parameter_TypesCount(allMethods, node) + this.accessTypesCount(allFields) + this.callTypesCount(allMethods, node);
        return totalCBO;
    }
    parameter_TypesCount(methods, node) {
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
        const uniqueParamTypes = new Set(); // Use a Set to store unique type identifiers
        const classReturnTypes = new Set(); // Set to track class return types
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
    accessTypesCount(Fields) {
        let CBO = 0; // Initialize DAC counter
        const usedClassTypes = new Set(); // To track unique types
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
                if (!primitiveTypes.has(fieldType.toLowerCase()) &&
                    !usedClassTypes.has(fieldType)) {
                    usedClassTypes.add(fieldType);
                    CBO++;
                }
            }
        }
        return CBO; // Return the final count
    }
    callTypesCount(methods, node) {
        const uniqueCalledClasses = new Set(); // Store unique class calls
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
exports.JavaCouplingBetweenObjects = JavaCouplingBetweenObjects;
//# sourceMappingURL=JavaCBO.js.map