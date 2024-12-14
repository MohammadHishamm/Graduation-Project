"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfAccessorMethods = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const FileExtractComponentsFromCode_1 = require("../../Extractors/FileExtractComponentsFromCode");
class JavaNumberOfAccessorMethods extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        const extractcomponentsfromcode = new FileExtractComponentsFromCode_1.FileExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const methods = extractcomponentsfromcode.extractMethods(node, Classes);
        const WOC = this.findaccessedmethods(methods);
        return WOC;
    }
    findaccessedmethods(Methods) {
        let NOAM = 0; // Initialize DAC counter
        for (const Method of Methods) {
            if (Method.isAccessor) {
                NOAM++;
            }
        }
        return NOAM; // Return the final count
    }
}
exports.JavaNumberOfAccessorMethods = JavaNumberOfAccessorMethods;
//# sourceMappingURL=JavaNOAM.js.map