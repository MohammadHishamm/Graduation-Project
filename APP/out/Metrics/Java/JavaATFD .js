"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaAccessToForeignData = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaAccessToForeignData extends MetricCalculator_1.MetricCalculator {
    calculate(node, FECFC, Filename) {
        console.log("\n[ATFD] Starting calculation for file:", Filename);
        let allClasses = [];
        let allMethods = [];
        let allFields = [];
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
        console.log("[ATFD] Found file components:", !!fileParsedComponents);
        if (fileParsedComponents) {
            const classGroups = fileParsedComponents.classes;
            classGroups.forEach((classGroup) => {
                allClasses = [...allClasses, ...classGroup.classes];
                allMethods = [...allMethods, ...classGroup.methods];
                allFields = [...allFields, ...classGroup.fields];
            });
        }
        return this.calculateATFD(node, allClasses, allMethods, allFields, FECFC, Filename);
    }
    isConstant(modifiers) {
        const modifierList = modifiers.toLowerCase().split(" ");
        return modifierList.includes("static") && modifierList.includes("final");
    }
    calculateATFD(rootNode, currentClasses, methods, fields, FECFC, Filename) {
        const currentClass = currentClasses[0];
        if (!currentClass) {
            console.log("[ATFD] No class found in current file");
            return 0;
        }
        console.log("[ATFD] Analyzing class:", currentClass.name);
        const accessCount = new Map();
        const ancestorClasses = new Set();
        let parent = currentClass.parent;
        while (parent) {
            ancestorClasses.add(parent);
            const parentClass = currentClasses.find((c) => c.name === parent);
            parent = parentClass?.parent;
        }
        console.log("[ATFD] Ancestor classes:", Array.from(ancestorClasses));
        const excludedTypes = new Set([
            "int",
            "float",
            "double",
            "boolean",
            "char",
            "byte",
            "short",
            "long",
            "void",
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
            "List",
            "Set",
            "Map",
            "Collection",
            "ArrayList",
            "HashSet",
            "HashMap",
        ]);
        const isExternalClass = (type) => {
            const baseType = type.split("<")[0].trim();
            return (!excludedTypes.has(baseType) &&
                baseType !== currentClass.name &&
                !ancestorClasses.has(baseType));
        };
        methods.forEach((method) => {
            console.log(`\n[ATFD] Analyzing method: ${method.name}`);
            // Find the foreign object variable name
            const foreignObjectTypes = new Map();
            for (let i = 0; i < method.localVariables.length; i++) {
                const type = method.localVariables[i];
                if (isExternalClass(type)) {
                    // The corresponding variable name should be in fieldsUsed
                    const varName = method.fieldsUsed[i];
                    if (varName) {
                        foreignObjectTypes.set(varName, type);
                        console.log(`[ATFD] Found foreign object: ${varName} of type ${type}`);
                    }
                }
            }
            // Count field accesses
            method.fieldAccess.forEach((fieldAccess) => {
                // Check if this field access is through a foreign object
                for (const [objName, objType] of foreignObjectTypes.entries()) {
                    if (fieldAccess.startsWith(objName + ".")) {
                        const accessKey = `${objType}.${fieldAccess.split(".")[1]}`;
                        const currentCount = (accessCount.get(accessKey) || 0) + 1;
                        accessCount.set(accessKey, currentCount);
                        console.log(`[ATFD] Field access: ${accessKey} (count: ${currentCount})`);
                    }
                }
            });
            // Count method calls
            method.methodCalls.forEach((methodCall) => {
                const [objName, methodName] = methodCall.split(".");
                // Skip method calls that don't start with 'set', 'Set', 'get', or 'Get'
                if (!methodName.match(/^[sS]et/) && !methodName.match(/^[gG]et/)) {
                    console.log(`[ATFD] Skipping Method call: ${methodName}`);
                    return;
                }
                if (foreignObjectTypes.has(objName)) {
                    const type = foreignObjectTypes.get(objName);
                    const accessKey = `${type}.${methodName}`;
                    const currentCount = (accessCount.get(accessKey) || 0) + 1;
                    accessCount.set(accessKey, currentCount);
                    console.log(`[ATFD] Method call: ${accessKey} (count: ${currentCount})`);
                }
            });
        });
        console.log("\n[ATFD] Access Summary:");
        for (const [access, count] of accessCount.entries()) {
            console.log(`${access}: ${count} times`);
        }
        const totalAccesses = Array.from(accessCount.values()).reduce((a, b) => a + b, 0);
        console.log(`[ATFD] Total foreign data accesses: ${totalAccesses}\n`);
        return totalAccesses;
    }
}
exports.JavaAccessToForeignData = JavaAccessToForeignData;
//# sourceMappingURL=JavaATFD%20.js.map