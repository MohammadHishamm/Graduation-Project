"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfPublicAttributes = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfPublicAttributes extends MetricCalculator_1.MetricCalculator {
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
        return this.calculatNumberOfPublicAttributes(allFields);
    }
    calculatNumberOfPublicAttributes(Fields) {
        let NOPA = 0;
        Fields.forEach((field) => {
            if (field.modifiers.includes("public")) {
                NOPA++;
            }
        });
        return NOPA;
    }
}
exports.JavaNumberOfPublicAttributes = JavaNumberOfPublicAttributes;
//# sourceMappingURL=JavaNOPA.js.map