import { MetricCalculator } from "../../Core/MetricCalculator";
import { FileExtractComponentsFromCode } from "../../Extractors/FileExtractComponentsFromCode";
import { MethodInfo } from "../../Interface/MethodInfo";

export class JavaNumberOfAccessorMethods extends MetricCalculator {
  calculate(node: any): number {
    const extractcomponentsfromcode = new FileExtractComponentsFromCode();
    const Classes = extractcomponentsfromcode.extractClasses(node);
    const methods = extractcomponentsfromcode.extractMethods(node, Classes);

    const WOC = this.findaccessedmethods(methods);

    return WOC;
  }

  private findaccessedmethods(Methods: MethodInfo[]): number {
    let NOAM = 0; // Initialize DAC counter

    for (const Method of Methods) {
      if (Method.isAccessor) {
        NOAM++;
      }
    }

    return NOAM; // Return the final count
  }
}
