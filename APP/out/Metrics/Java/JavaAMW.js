"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaAverageMethodWeight = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const JavaWMC_1 = require("../Java/JavaWMC");
const JavaNOM_1 = require("../Java/JavaNOM");
class JavaAverageMethodWeight extends MetricCalculator_1.MetricCalculator {
    calculate(node, sourceCode, FECFC, Filename) {
        const javaWeightedMethodCount = new JavaWMC_1.JavaWeightedMethodCount();
        const WMC = javaWeightedMethodCount.calculate(node, sourceCode, FECFC, Filename); // Calculate WMC (Weighted Method Count)
        const javaNumberOfMethodsMetric = new JavaNOM_1.JavaNumberOfMethods();
        const NOM = javaNumberOfMethodsMetric.calculate(node, sourceCode, FECFC, Filename); // Calculate NOM (Number of Methods)
        // Return AMW (Average Method Weight), handle division by zero case
        return NOM === 0 ? 0 : WMC / NOM;
    }
}
exports.JavaAverageMethodWeight = JavaAverageMethodWeight;
//# sourceMappingURL=JavaAMW.js.map