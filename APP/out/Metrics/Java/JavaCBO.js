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
        // Calculate CBO from method parameters, field accesses, and method calls
        // totalCBO += this.parameter_TypesCount(allMethods, node);
        totalCBO += this.accessTypesCount(allFields);
        totalCBO += this.callTypesCount(allMethods);
        return totalCBO;
    }
    parameter_TypesCount(methods, node) {
        const methodNodes = node.descendantsOfType("method_declaration");
        let total = 0;
        const primitiveTypes = new Set([
            "int", "float", "double", "boolean", "char", "byte", "short", "long", "void", "string",
        ]);
        const uniqueParamTypes = new Set(); // Use a Set to store unique class type identifiers
        const classReturnTypes = new Set(); // Track class return types
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
        // Combine return values and unique parameter types
        total = classReturnTypes.size + uniqueParamTypes.size;
        return total;
    }
    accessTypesCount(fields) {
        let CBO = 0;
        const usedClassTypes = new Set();
        const primitiveTypes = new Set([
            "int", "float", "double", "boolean", "char", "byte", "short", "long", "void", "string",
        ]);
        for (const field of fields) {
            const fieldType = field.type;
            if (!fieldType) {
                return CBO;
            }
            const genericMatch = fieldType.match(/^(\w+)<(.+)>$/);
            if (!genericMatch) {
                if (!primitiveTypes.has(fieldType.toLowerCase()) &&
                    !usedClassTypes.has(fieldType)) {
                    usedClassTypes.add(fieldType);
                    CBO++;
                }
            }
        }
        return CBO;
    }
    callTypesCount(methods) {
        const uniqueCalledClasses = new Set();
        methods.forEach((method) => {
            if (method && method.methodCalls) {
                method.fieldsUsed.forEach((methodCall) => {
                    const classCall = methodCall;
                    if (!uniqueCalledClasses.has(classCall)) {
                        console.log("uniqueCalledClasses", classCall);
                        uniqueCalledClasses.add(classCall);
                    }
                });
            }
        });
        return uniqueCalledClasses.size;
    }
}
exports.JavaCouplingBetweenObjects = JavaCouplingBetweenObjects;
//# sourceMappingURL=JavaCBO.js.map