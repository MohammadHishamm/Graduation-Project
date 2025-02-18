"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaCouplingBetweenObjects = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaCouplingBetweenObjects extends MetricCalculator_1.MetricCalculator {
    calculate(node, FECFC, Filename) {
        console.log("\n[CBO] Starting calculation for file:", Filename);
        let allClasses = [];
        let allMethods = [];
        let allFields = [];
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
        if (!fileParsedComponents) {
            console.log("[CBO] No components found in file");
            return 0;
        }
        // Collect all classes, methods, and fields
        const classGroups = fileParsedComponents.classes;
        classGroups.forEach((classGroup) => {
            allClasses = [...allClasses, ...classGroup.classes];
            allMethods = [...allMethods, ...classGroup.methods];
            allFields = [...allFields, ...classGroup.fields];
        });
        console.log("[CBO] Classes found:", allClasses.map((c) => c.name));
        // Calculate CBO for each class
        let totalCBO = 0;
        for (const currentClass of allClasses) {
            const classSpecificCBO = this.calculateClassCBO(currentClass, allClasses, allMethods, allFields);
            totalCBO += classSpecificCBO;
        }
        return totalCBO;
    }
    calculateClassCBO(currentClass, allClasses, allMethods, allFields) {
        const currentClassName = currentClass.name;
        console.log(`[CBO] Calculating CBO for class: ${currentClassName}`);
        // Track external classes that are actually interacted with
        const externalInteractions = new Set();
        // Get methods belonging to this class
        const classMethods = allMethods.filter((method) => allClasses.some((cls) => cls.name === currentClassName &&
            method.startPosition.row >= cls.startPosition.row &&
            method.endPosition.row <= cls.endPosition.row));
        console.log(`[CBO] Found ${classMethods.length} methods in class ${currentClassName}`);
        // Create a map to store field types
        const fieldTypeMap = new Map();
        allFields.forEach((field) => {
            fieldTypeMap.set(field.name.toLowerCase(), field.type);
        });
        // Process each method in the class
        classMethods.forEach((method) => {
            // Create a map to store the mapping between object names and their types
            const objectTypeMap = new Map();
            // Map object names to their types based on local variables
            method.methodBody.forEach((statement, index) => {
                if (index < method.localVariables.length) {
                    const type = method.localVariables[index];
                    const objectName = method.fieldsUsed[index];
                    if (type && objectName) {
                        objectTypeMap.set(objectName.toLowerCase(), type);
                    }
                }
            });
            // Process method calls to track actual interactions
            method.methodCalls.forEach((methodCall) => {
                const parts = methodCall.split(".");
                if (parts.length > 1) {
                    const objectName = parts[0].toLowerCase(); // e.g., "customer1", "savings", "bank"
                    // Check both field types and local variables
                    const localType = objectTypeMap.get(objectName);
                    const fieldType = fieldTypeMap.get(objectName);
                    // Use field type if available, otherwise use local type
                    const type = fieldType || localType;
                    if (type && type !== currentClassName) {
                        externalInteractions.add(type);
                        console.log(`[CBO] Found method call to external class: ${type} through ${methodCall}`);
                    }
                }
            });
        });
        const cboValue = externalInteractions.size;
        console.log(`[CBO] External interactions for ${currentClassName}: ${Array.from(externalInteractions).join(", ")}`);
        console.log(`[CBO] Final CBO value for ${currentClassName}: ${cboValue}`);
        return cboValue;
    }
}
exports.JavaCouplingBetweenObjects = JavaCouplingBetweenObjects;
//# sourceMappingURL=JavaCBO.js.map