import { MetricCalculator } from '../../Core/MetricCalculator';
import { JavaWeightedMethodCount } from '../Java/JavaWMC';
import { JavaNumberOfMethods } from '../Java/JavaNOM';
import { FolderExtractComponentsFromCode } from '../../Extractors/FolderExtractComponentsFromCode';

export class JavaAverageMethodWeight extends MetricCalculator {
    calculate(node: any, sourceCode: string, FECFC: FolderExtractComponentsFromCode, Filename: string): number {
        const javaWeightedMethodCount = new JavaWeightedMethodCount();
        const WMC = javaWeightedMethodCount.calculate(node, sourceCode, FECFC, Filename);  // Calculate WMC (Weighted Method Count)

        const javaNumberOfMethodsMetric = new JavaNumberOfMethods();
        const NOM = javaNumberOfMethodsMetric.calculate(node, sourceCode, FECFC, Filename);  // Calculate NOM (Number of Methods)

        // Return AMW (Average Method Weight), handle division by zero case
        return NOM === 0 ? 0 : WMC / NOM;
    }
}
