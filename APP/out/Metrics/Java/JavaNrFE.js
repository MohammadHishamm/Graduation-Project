"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberofFeatureEnvyMethods = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const ExtractComponentsFromCode_1 = require("../../Extractors/ExtractComponentsFromCode");
const JavaATFD_1 = require("./JavaATFD ");
const JavaFDP_1 = require("./JavaFDP");
const JavaLAA_1 = require("./JavaLAA");
class JavaNumberofFeatureEnvyMethods extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode, FECFC) {
        const AccessToForeignData = new JavaATFD_1.JavaAccessToForeignData();
        const AccessofImportData = new JavaFDP_1.JavaAccessofImportData();
        const LocalityofAttributeAccess = new JavaLAA_1.JavaLocalityofAttributeAccess();
        const extractcomponentsfromcode = new ExtractComponentsFromCode_1.ExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const methods = extractcomponentsfromcode.extractMethods(node, Classes);
        const Fields = extractcomponentsfromcode.extractFields(node, Classes);
        const NrFE = this.calculateNrFE(node, Classes, methods, Fields, FECFC, AccessToForeignData, AccessofImportData, LocalityofAttributeAccess, sourceCode);
        console.log("[NrFE] Final Metric Value:", NrFE);
        return NrFE;
    }
    calculateNrFE(rootNode, currentClasses, methods, fields, FECFC, AccessToForeignData, AccessofImportData, LocalityofAttributeAccess, sourceCode) {
        let featureEnvyCount = 0;
        for (const method of methods) {
            // Skip constructors
            if (method.isConstructor) {
                continue;
            }
            // Calculate metrics for the current method
            const ATFD = AccessToForeignData.calculate(rootNode, sourceCode, FECFC);
            const FDP = AccessofImportData.calculate(rootNode, sourceCode, FECFC);
            const LAA = LocalityofAttributeAccess.calculate(rootNode, sourceCode, FECFC);
            // Check Feature Envy conditions
            if (ATFD > 2.0 && FDP <= 2.0 && LAA < 0.333) {
                featureEnvyCount++;
            }
        }
        return featureEnvyCount;
    }
}
exports.JavaNumberofFeatureEnvyMethods = JavaNumberofFeatureEnvyMethods;
//# sourceMappingURL=JavaNrFE.js.map