"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfProtectedMethods = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfProtectedMethods extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode, FECFC, Filename) {
        let allClasses = [];
        let allMethods = [];
        let allFields = [];
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
        if (fileParsedComponents) {
            const classGroups = fileParsedComponents.classes;
            classGroups.forEach((classGroup) => {
                allClasses = allClasses.concat(classGroup.classes);
                allMethods = allMethods.concat(classGroup.methods);
                allFields = allFields.concat(classGroup.fields);
            });
        }
        const NProtM = this.claculateNumberOfProtectedMethods(allMethods);
        return NProtM;
    }
    claculateNumberOfProtectedMethods(Methods) {
        let NProtM = 0; // Initialize DAC counter
        for (const Method of Methods) {
            if (Method.modifiers.includes("protected")) {
                NProtM++;
            }
        }
        return NProtM; // Return the final count
    }
}
exports.JavaNumberOfProtectedMethods = JavaNumberOfProtectedMethods;
//# sourceMappingURL=JavaNProtM.js.map