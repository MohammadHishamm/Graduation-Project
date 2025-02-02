"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaLOCMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaLOCMetric extends MetricCalculator_1.MetricCalculator {
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
        if (!allClasses || allClasses.length === 0) {
            console.warn("Warning: No classes extracted from the file.");
            return 0;
        }
        let totalLOCC = 0;
        allClasses.forEach((classInfo) => {
            if (!classInfo.startPosition || !classInfo.endPosition) {
                console.warn(`Warning: Missing position data in class ${classInfo.name}`);
                return;
            }
            const startLine = classInfo.startPosition.row;
            const endLine = classInfo.endPosition.row;
            totalLOCC += (endLine - startLine + 1);
        });
        return totalLOCC;
    }
}
exports.JavaLOCMetric = JavaLOCMetric;
//# sourceMappingURL=JavaLOCC.js.map