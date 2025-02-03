"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfAbstractClassesM = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaNumberOfAbstractClassesM extends MetricCalculator_1.MetricCalculator {
    calculate(node, FECFC, Filename) {
        let abstractClassCount = 0;
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
        allClasses.forEach((classes) => {
            if (classes.isAbstract) {
                abstractClassCount++;
            }
        });
        return abstractClassCount;
    }
}
exports.JavaNumberOfAbstractClassesM = JavaNumberOfAbstractClassesM;
//# sourceMappingURL=JavaNAbsm.js.map