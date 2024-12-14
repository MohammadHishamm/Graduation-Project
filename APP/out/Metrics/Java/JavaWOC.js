"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaWeightOfAClass = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const FileExtractComponentsFromCode_1 = require("../../Extractors/FileExtractComponentsFromCode");
class JavaWeightOfAClass extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        const extractcomponentsfromcode = new FileExtractComponentsFromCode_1.FileExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const methods = extractcomponentsfromcode.extractMethods(node, Classes);
        const Fields = extractcomponentsfromcode.extractFields(node, Classes);
        const filteredFields = extractcomponentsfromcode.filterPublicNonEncapsulatedFields(Fields, methods);
        const WOC = this.calculateWeight(methods, filteredFields);
        return WOC;
    }
    // Calculate the weight of the class
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
            if (field.modifiers.includes("public")) {
                ++nom;
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