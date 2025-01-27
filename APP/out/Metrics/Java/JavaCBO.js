"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaCouplingBetweenObjects = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const ExtractComponentsFromCode_1 = require("../../Extractors/ExtractComponentsFromCode");
class JavaCouplingBetweenObjects extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        const extractor = new ExtractComponentsFromCode_1.ExtractComponentsFromCode();
        const extractedClasses = extractor.extractClasses(node);
        if (!extractedClasses || extractedClasses.length === 0) {
            console.warn("Warning: No classes extracted from the file.");
            return 0;
        }
        let totalCBO = 0;
        extractedClasses.forEach((classInfo) => {
            // const paraRetTypesCount = this.para_retTypesCount(classInfo);
            // const accessTypesCount = this.accessTypesCount(classInfo);
            // const callTypesCount = this.callTypesCount(classInfo);
            // Combine the results of the three metrics
            const cboForClass = new Set([
            // ...paraRetTypesCount,
            // ...accessTypesCount,
            // ...callTypesCount,
            ]);
            totalCBO += cboForClass.size;
        });
        return totalCBO;
    }
}
exports.JavaCouplingBetweenObjects = JavaCouplingBetweenObjects;
//# sourceMappingURL=JavaCBO.js.map