"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberofFeatureEnvyMethods = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const JavaATFD_1 = require("./JavaATFD ");
const JavaFDP_1 = require("./JavaFDP");
const JavaLAA_1 = require("./JavaLAA");
class JavaNumberofFeatureEnvyMethods extends MetricCalculator_1.MetricCalculator {
    calculate(node, FECFC, Filename) {
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
        const AccessToForeignData = new JavaATFD_1.JavaAccessToForeignData();
        const AccessofImportData = new JavaFDP_1.JavaAccessofImportData();
        const LocalityofAttributeAccess = new JavaLAA_1.JavaLocalityofAttributeAccess();
        const NrFE = this.calculateNrFE(node, allMethods, FECFC, AccessToForeignData, AccessofImportData, LocalityofAttributeAccess, Filename);
        console.log("[NrFE] Final Metric Value:", NrFE);
        return NrFE;
    }
    calculateNrFE(rootNode, methods, FECFC, AccessToForeignData, AccessofImportData, LocalityofAttributeAccess, Filename) {
        let featureEnvyCount = 0;
        for (const method of methods) {
            // Skip constructors
            if (method.isConstructor) {
                continue;
            }
            // Calculate metrics for the current method
            const ATFD = AccessToForeignData.calculate(rootNode, FECFC, Filename);
            const FDP = AccessofImportData.calculate(rootNode, FECFC, Filename);
            const LAA = LocalityofAttributeAccess.calculate(rootNode, FECFC, Filename);
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