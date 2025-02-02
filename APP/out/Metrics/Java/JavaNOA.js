"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfAttributes = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfAttributes extends MetricCalculator_1.MetricCalculator {
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
        return allFields.length;
    }
}
exports.JavaNumberOfAttributes = JavaNumberOfAttributes;
//# sourceMappingURL=JavaNOA.js.map