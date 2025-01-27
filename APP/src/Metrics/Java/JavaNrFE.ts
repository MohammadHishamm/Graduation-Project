import Parser from "tree-sitter";
import { MetricCalculator } from "../../Core/MetricCalculator";
import { ExtractComponentsFromCode } from "../../Extractors/ExtractComponentsFromCode";
import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
import { MethodInfo } from "../../Interface/MethodInfo";
import { JavaAccessToForeignData } from "./JavaATFD ";
import { JavaAccessofImportData } from "./JavaFDP";
import { JavaLocalityofAttributeAccess } from "./JavaLAA";

interface Reference {
  name: string;
  type: "field" | "method";
}

export class JavaNumberofFeatureEnvyMethods extends MetricCalculator {
  calculate(
    node: any,
    sourceCode: string,
    FECFC: FolderExtractComponentsFromCode
  ): number {
    const AccessToForeignData = new JavaAccessToForeignData();
    const AccessofImportData = new JavaAccessofImportData();
    const LocalityofAttributeAccess = new JavaLocalityofAttributeAccess();
    const extractcomponentsfromcode = new ExtractComponentsFromCode();

    const Classes = extractcomponentsfromcode.extractClasses(node);
    const methods = extractcomponentsfromcode.extractMethods(node, Classes);
    const Fields = extractcomponentsfromcode.extractFields(node, Classes);

    const NrFE = this.calculateNrFE(
      node,
      Classes,
      methods,
      Fields,
      FECFC,
      AccessToForeignData,
      AccessofImportData,
      LocalityofAttributeAccess,
      sourceCode
    );

    console.log("[NrFE] Final Metric Value:", NrFE);
    return NrFE;
  }

  private calculateNrFE(
    rootNode: Parser.SyntaxNode,
    currentClasses: ClassInfo[],
    methods: MethodInfo[],
    fields: FieldInfo[],
    FECFC: FolderExtractComponentsFromCode,
    AccessToForeignData: JavaAccessToForeignData,
    AccessofImportData: JavaAccessofImportData,
    LocalityofAttributeAccess: JavaLocalityofAttributeAccess,
    sourceCode: string
  ): number {
    let featureEnvyCount = 0;

    for (const method of methods) {
      // Skip constructors
      if (method.isConstructor) {
        continue;
      }

      // Calculate metrics for the current method
      const ATFD = AccessToForeignData.calculate(rootNode, sourceCode, FECFC);
      const FDP = AccessofImportData.calculate(rootNode, sourceCode, FECFC);
      const LAA = LocalityofAttributeAccess.calculate(
        rootNode,
        sourceCode,
        FECFC
      );

      // Check Feature Envy conditions
      if (ATFD > 2.0 && FDP <= 2.0 && LAA < 0.333) {
        featureEnvyCount++;
      }
    }

    return featureEnvyCount;
  }
}
