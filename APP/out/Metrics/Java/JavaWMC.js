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
            method.methodBody.forEach((statement) => {
                if (statement.includes("if_statement") ||
                    statement.includes("while_statement") ||
                    statement.includes("do_statement") ||
                    statement.includes("catch_clause") ||
                    statement.includes("case") ||
                    statement.includes("throw_statement") ||
                    statement.includes("break_statement") ||
                    statement.includes("continue_statement") ||
                    statement.includes("for_statement") ||
                    statement.includes("condition") ||
                    statement.includes("ternary_expression") ||
                    method) {
                    complexity++;
                }
            });
        });
        return complexity;
    }
}
exports.JavaWeightedMethodCount = JavaWeightedMethodCount;
//# sourceMappingURL=JavaWMC.js.map