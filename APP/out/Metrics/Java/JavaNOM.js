"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfMethods = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfMethods extends MetricCalculator_1.MetricCalculator {
    calculate(node, FECFC, Filename) {
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
        return allMethods.length;
    }
}
exports.JavaNumberOfMethods = JavaNumberOfMethods;
//# sourceMappingURL=JavaNOM.js.map