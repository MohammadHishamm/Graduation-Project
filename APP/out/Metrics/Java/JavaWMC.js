"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaWeightedMethodCount = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaWeightedMethodCount extends MetricCalculator_1.MetricCalculator {
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
        return this.calculateWeightedMethodCount(allMethods);
    }
    calculateWeightedMethodCount(methods) {
        let complexity = 0;
        methods.forEach((method) => {
            if (method.methodBody.length > 0) {
                complexity++;
                method.methodBody.forEach((statement) => {
                    if (statement === "if_statement" ||
                        statement === "while_statement" ||
                        statement === "do_statement" ||
                        statement === "case" ||
                        statement === "for_statement" ||
                        statement === "condition" ||
                        statement === "ternary_expression") {
                        complexity++;
                    }
                });
            }
        });
        return complexity;
    }
}
exports.JavaWeightedMethodCount = JavaWeightedMethodCount;
//# sourceMappingURL=JavaWMC.js.map