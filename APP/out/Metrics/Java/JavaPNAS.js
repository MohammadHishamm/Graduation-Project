"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaProportionOfNewAddedServices = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaProportionOfNewAddedServices extends MetricCalculator_1.MetricCalculator {
    // Return a Promise from calculate
    calculate(node, FECFC, Filename) {
        let allClasses = [];
        let allMethods = [];
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
        if (fileParsedComponents) {
            const classGroups = fileParsedComponents.classes;
            classGroups.forEach((classGroup) => {
                allClasses = [...allClasses, ...classGroup.classes];
                allMethods = [...allMethods, ...classGroup.methods];
            });
        }
        return this.calculatePNAS(allClasses, allMethods);
    }
    calculatePNAS(classes, methods) {
        // Exit early if no classes or no parent class
        const parentClass = classes[0]?.parent;
        if (!parentClass) {
            console.log("[PNAS] No parent class found. PNAS = -1");
            return -1;
        }
        // Filter methods that are:
        // 1. Public
        // 2. Not constructors
        const publicNonConstructorMethods = methods.filter((method) => {
            const isPublic = method.modifiers.includes("public");
            const isNotConstructor = !method.isConstructor;
            if (isPublic && isNotConstructor) {
                console.log(`[PNAS] Selected public method: ${method.name}`);
                return true;
            }
            else {
                if (!isPublic)
                    console.log(`[PNAS] Skipped method (not public): ${method.name}`);
                if (!isNotConstructor)
                    console.log(`[PNAS] Skipped method (constructor): ${method.name}`);
                return false;
            }
        });
        // Filter non-overridden methods
        const nonOverriddenMethods = publicNonConstructorMethods.filter((method) => {
            const isNotOverridden = !method.isOverridden;
            if (isNotOverridden) {
                console.log(`[PNAS] Non-overridden method: ${method.name}`);
                return true;
            }
            console.log(`[PNAS] Skipped overridden method: ${method.name}`);
            return false;
        });
        // Calculate PNAS: Proportion of Non-Overridden Public Methods
        const totalPublicNonConstructorMethods = publicNonConstructorMethods.length;
        const totalNonOverriddenMethods = nonOverriddenMethods.length;
        // Prevent division by zero
        if (totalPublicNonConstructorMethods === 0) {
            console.log("[PNAS] No public non-constructor methods found. PNAS = -1");
            return -1;
        }
        const pnas = totalNonOverriddenMethods / totalPublicNonConstructorMethods;
        console.log(`[PNAS] Total Public Non-Constructor Methods: ${totalPublicNonConstructorMethods}`);
        console.log(`[PNAS] Total Non-Overridden Methods: ${totalNonOverriddenMethods}`);
        console.log(`[PNAS] Calculated PNAS: ${pnas.toFixed(2)}`);
        return pnas;
    }
}
exports.JavaProportionOfNewAddedServices = JavaProportionOfNewAddedServices;
//# sourceMappingURL=JavaPNAS.js.map