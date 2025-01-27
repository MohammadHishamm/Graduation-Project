"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaLOCMetric = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const ExtractComponentsFromCode_1 = require("../../Extractors/ExtractComponentsFromCode");
class JavaLOCMetric extends MetricCalculator_1.MetricCalculator {
    calculate(node) {
        const extractor = new ExtractComponentsFromCode_1.ExtractComponentsFromCode();
        const extractedClasses = extractor.extractClasses(node);
        if (!extractedClasses || extractedClasses.length === 0) {
            console.warn("Warning: No classes extracted from the file.");
            return 0;
        }
        let totalLOCC = 0;
        extractedClasses.forEach((classInfo) => {
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