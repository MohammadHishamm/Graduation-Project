"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfAddedServices = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfAddedServices extends MetricCalculator_1.MetricCalculator {
    // Return a Promise from calculate
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
        return this.findNAS(allClasses, allMethods, FECFC);
    }
    findNAS(classes, methods, FECFC) {
        let NAS = 0;
        // Exit early if no classes or no parent class
        const parentClass = classes[0]?.parent;
        if (!parentClass) {
            console.log("[NAS] No parent class found. NAS = 0");
            return 0;
        }
        // Filter methods that are public, not constructors, and not accessors
        const publicNonAccessorMethods = methods.filter((method) => {
            const isPublic = method.modifiers.includes("public");
            const isNotConstructor = !method.isConstructor;
            const isNotAccessor = !method.isAccessor;
            if (isPublic && isNotConstructor && isNotAccessor) {
                console.log(`[NAS] Selected method: ${method.name}`);
                return true;
            }
            else {
                if (!isPublic) {
                    console.log(`[NAS] Skipped method (not public): ${method.name}`);
                }
                if (!isNotConstructor) {
                    console.log(`[NAS] Skipped method (constructor): ${method.name}`);
                }
                if (!isNotAccessor) {
                    console.log(`[NAS] Skipped method (accessor): ${method.name}`);
                }
                return false;
            }
        });
        // Filter overridden methods
        const overriddenMethods = methods.filter((method) => {
            if (method.isOverridden) {
                console.log(`[NAS] Overridden method: ${method.name}`);
                return true;
            }
            return false;
        });
        // Calculate NAS as count of public methods minus overridden methods
        NAS = publicNonAccessorMethods.length - overriddenMethods.length;
        console.log(`[NAS] Public Non-Accessor Methods: ${publicNonAccessorMethods.length}`);
        console.log(`[NAS] Overridden Methods: ${overriddenMethods.length}`);
        console.log(`[NAS] Final NAS: ${Math.max(NAS, 0)}`);
        return Math.max(NAS, 0); // Ensure NAS is not negative
    }
}
exports.JavaNumberOfAddedServices = JavaNumberOfAddedServices;
//# sourceMappingURL=JavaNAS.js.map