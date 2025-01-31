"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TCCCalculation = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class TCCCalculation extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode, FECFC, Filename) {
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
        const TCC = this.calculateTCC(allMethods, allFields);
        return TCC;
    }
    // Simulate field usage extraction for a method
    calculateTCC(methods, fields) {
        let pairs = 0;
        for (let i = 0; i < methods.length; i++) {
            if (!methods[i].isConstructor) {
                const methodA = methods[i];
                const fieldsA = methods[i].fieldsUsed;
                let key = true;
                for (let j = 0; j < methods.length; j++) {
                    if (!methods[j].isConstructor && methodA.name !== methods[j].name) {
                        const fieldsB = methods[j].fieldsUsed;
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