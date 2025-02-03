"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaAccessofImportData = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaAccessofImportData extends MetricCalculator_1.MetricCalculator {
    calculate(node, FECFC, Filename) {
        console.log("\n[FDP] Starting calculation for file:", Filename);
        let allClasses = [];
        let allMethods = [];
        let allFields = [];
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
        console.log("[FDP] Found file components:", !!fileParsedComponents);
        if (fileParsedComponents) {
            const classGroups = fileParsedComponents.classes;
            classGroups.forEach((classGroup) => {
                allClasses = [...allClasses, ...classGroup.classes];
                allMethods = [...allMethods, ...classGroup.methods];
                allFields = [...allFields, ...classGroup.fields];
            });
            console.log("[FDP] Classes found:", allClasses.map((c) => c.name));
            allClasses.forEach((cls) => {
                console.log("[FDP] Class:", cls.name, "Parent:", cls.parent || "none");
            });
        }
        return this.calculateFDP(node, allClasses, allMethods, allFields, FECFC, Filename);
    }
    calculateFDP(rootNode, currentClasses, methods, fields, FECFC, Filename) {
        const foreignClassesAccessed = new Set();
        const currentClassName = currentClasses[0]?.name;
        if (!currentClassName) {
            console.log("[FDP] No class found in current file");
            return 0;
        }
        // Primitive types to exclude
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
            "String",
            "Integer",
            "Float",
            "Double",
            "Boolean",
            "Character",
            "Byte",
            "Short",
            "Long",
            "Void",
        ]);
        // System and standard library packages to exclude
        const systemPackages = new Set([
            "System",
            "Math",
            "Arrays",
            "Collections",
            "List",
            "Map",
            "Set",
            "out",
            "print",
            "println",
            "console",
            "Integer",
            "Double",
            "Boolean",
            "String",
        ]);
        // Helper: Check if a type is foreign
        const isForeignClass = (type) => {
            const baseType = type.split("<")[0].trim();
            return (!primitiveTypes.has(baseType) &&
                baseType !== currentClassName &&
                !systemPackages.has(baseType));
        };
        // Process methods to find usage of foreign class method calls
        methods.forEach((method) => {
            method.methodCalls.forEach((methodCall) => {
                // Only process method calls with a dot
                if (!methodCall.includes("."))
                    return;
                // Split the method call and take the first part
                const objectName = methodCall.split(".")[0];
                // Skip primitive or current class names or system packages
                if (primitiveTypes.has(objectName) ||
                    objectName === currentClassName ||
                    systemPackages.has(objectName)) {
                    return;
                }
                // If the object name is not a primitive and not the current class
                if (isForeignClass(objectName)) {
                    foreignClassesAccessed.add(objectName);
                    console.log(`[FDP] Found usage of foreign class through method call: ${methodCall}`);
                }
            });
        });
        const foreignClasses = Array.from(foreignClassesAccessed);
        console.log("\n[FDP] Foreign Classes Accessed:", foreignClasses);
        console.log("[FDP] Total count:", foreignClasses.length);
        return foreignClassesAccessed.size;
    }
}
exports.JavaAccessofImportData = JavaAccessofImportData;
//# sourceMappingURL=JavaFDP.js.map