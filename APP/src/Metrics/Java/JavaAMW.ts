import { MetricCalculator } from '../../Core/MetricCalculator';
import { JavaWeightedMethodCount } from '../Java/JavaWMC';
import { JavaNumberOfMethodsMetric } from '../Java/JavaNOM';

export class JavaAverageMethodWeight extends MetricCalculator {
    calculate(node: any): number {
        const javaWeightedMethodCount = new JavaWeightedMethodCount();
        const WMC = javaWeightedMethodCount.calculate(node);  // Calculate WMC (Weighted Method Count)

        const javaNumberOfMethodsMetric = new JavaNumberOfMethodsMetric();
        const NOM = javaNumberOfMethodsMetric.calculate(node);  // Calculate NOM (Number of Methods)

        // Return AMW (Average Method Weight), handle division by zero case
        return NOM === 0 ? 0 : WMC / NOM;
    }
}
