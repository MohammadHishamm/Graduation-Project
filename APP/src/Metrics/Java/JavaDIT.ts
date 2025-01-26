import Parser from "tree-sitter";

import { MetricCalculator } from "../../Core/MetricCalculator";
import { FileExtractComponentsFromCode } from "../../Extractors/FileExtractComponentsFromCode";
import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
import { ClassInfo } from "../../Interface/ClassInfo";

export class DepthOfInheritanceTree extends MetricCalculator {
  // Return a Promise from calculate
  calculate(
    node: any,
    sourceCode: string,
    FECFC: FolderExtractComponentsFromCode
  ): number {
    const extractcomponentsfromcode = new FileExtractComponentsFromCode();
    const Classes = extractcomponentsfromcode.extractClasses(node);
    const methods = extractcomponentsfromcode.extractMethods(node, Classes);

    return this.findDIT(Classes, node, FECFC);
  }

  
}