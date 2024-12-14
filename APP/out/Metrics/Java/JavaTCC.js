"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TCCCalculation = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const FileExtractComponentsFromCode_1 = require("../../Extractors/FileExtractComponentsFromCode");
class TCCCalculation extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        const extractcomponentsfromcode = new FileExtractComponentsFromCode_1.FileExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const methods = extractcomponentsfromcode.extractMethods(node, Classes);
        const Fields = extractcomponentsfromcode.extractFields(node, Classes);
        const TCC = this.calculateTCC(node, methods, Fields, extractcomponentsfromcode);
        return TCC;
    }
    // Simulate field usage extraction for a method
    calculateTCC(rootNode, methods, fields, extractcomponentsfromcode) {
        let pairs = 0;
        for (let i = 0; i < methods.length; i++) {
            if (!methods[i].isConstructor) {
                const methodA = methods[i];
                const fieldsA = extractcomponentsfromcode.getFieldsUsedInMethod(rootNode, methodA);
                let key = true;
                for (let j = 0; j < methods.length; j++) {
                    if (!methods[j].isConstructor && methodA.name !== methods[j].name) {
                        const methodB = methods[j];
                        const fieldsB = extractcomponentsfromcode.getFieldsUsedInMethod(rootNode, methodB);
                        // Check for any shared field
                        for (const field of fieldsA) {
                            if (fieldsB.includes(field) && key) {
                                for (const classfields of fields) {
                                    if (classfields.name !== field) {
                                        pairs++; // Increment shared connections
                                        key = false;
                                        break; // Exit as one shared field is enough
                                    }
                                }
                            }
                        }
                    }
                    if (!key) {
                        break;
                    }
                }
            }
        }
        // Calculate and return TCC
        const nummeth = methods.length;
        const tcc = ((pairs - 1) * pairs) / (nummeth * (nummeth - 1));
        if (nummeth === 0 || nummeth === 1) {
            return nummeth;
        }
        else {
            return parseFloat(tcc.toFixed(2));
        }
    }
}
exports.TCCCalculation = TCCCalculation;
//# sourceMappingURL=JavaTCC.js.map