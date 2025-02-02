"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaWeightOfAClass = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaWeightOfAClass extends MetricCalculator_1.MetricCalculator {
    //TODO FECFC , FileParsedComponents
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
        const WOC = this.calculateWeight(allMethods, allFields);
        return WOC;
    }
    calculateWeight(methods, fields) {
        let nom = 0; // Numerator: public methods (non-constructor and non-accessor) + public attributes
        let den = 0; // Denominator: public methods that are not accessors
        methods.forEach((method) => {
            if (!method.isConstructor && method.modifiers.includes("public")) {
                ++nom;
                if (method.isAccessor) {
                    ++den;
                }
            }
        });
        fields.forEach((field) => {
            if (field.modifiers.includes("public") && !field.isEncapsulated) {
                ++nom;
                ++den;
            }
        });
        if (nom === 0) {
            return 0; // If no valid public elements, return 0
        }
        let x;
        x = den / nom;
        return 1 - x;
    }
}
exports.JavaWeightOfAClass = JavaWeightOfAClass;
//# sourceMappingURL=JavaWOC.js.map