import Parser from "tree-sitter";
import { MetricCalculator } from "../../Core/MetricCalculator";

import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
import { ClassInfo } from "../../Interface/ClassInfo";
import { MethodInfo } from "../../Interface/MethodInfo";
import { FieldInfo } from "../../Interface/FieldInfo";


import { JavaAccessToForeignData } from "./JavaATFD ";
import { JavaAccessofImportData } from "./JavaFDP";
import { JavaLocalityofAttributeAccess } from "./JavaLAA";

interface Reference {
  name: string;
  type: "field" | "method";
}

export class JavaNumberofFeatureEnvyMethods extends MetricCalculator {
    calculate(node: any, sourceCode: string, FECFC: FolderExtractComponentsFromCode, Filename: string): number 
    { 
      let allClasses: ClassInfo[] = [];
      let allMethods: MethodInfo[] = [];
      let allFields: FieldInfo[] = [];
  
      const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
  
      if (fileParsedComponents) 
      {
        const classGroups = fileParsedComponents.classes;
        classGroups.forEach((classGroup) => 
        {
          allClasses = [...allClasses, ...classGroup.classes];
          allMethods = [...allMethods, ...classGroup.methods];
          allFields = [...allFields, ...classGroup.fields];
        });
      }

    const AccessToForeignData = new JavaAccessToForeignData();
    const AccessofImportData = new JavaAccessofImportData();
    const LocalityofAttributeAccess = new JavaLocalityofAttributeAccess();



    const NrFE = this.calculateNrFE(
      node,
      allMethods,
      FECFC,
      AccessToForeignData,
      AccessofImportData,
      LocalityofAttributeAccess,
      sourceCode,
      Filename
    );

    console.log("[NrFE] Final Metric Value:", NrFE);
    return NrFE;
  }

  private calculateNrFE(
    rootNode: Parser.SyntaxNode,
    methods: MethodInfo[],
    FECFC: FolderExtractComponentsFromCode,
    AccessToForeignData: JavaAccessToForeignData,
    AccessofImportData: JavaAccessofImportData,
    LocalityofAttributeAccess: JavaLocalityofAttributeAccess,
    sourceCode: string,
    Filename: string
  ): number {
    let featureEnvyCount = 0;

    for (const method of methods) {
      // Skip constructors
      if (method.isConstructor) {
        continue;
      }

      // Calculate metrics for the current method
      const ATFD = AccessToForeignData.calculate(rootNode, sourceCode, FECFC , Filename);
      const FDP = AccessofImportData.calculate(rootNode, sourceCode, FECFC , Filename);
      const LAA = LocalityofAttributeAccess.calculate(
        rootNode,
        sourceCode,
        FECFC ,
        Filename
      );

      // Check Feature Envy conditions
      if (ATFD > 2.0 && FDP <= 2.0 && LAA < 0.333) {
        featureEnvyCount++;
      }
    }

    return featureEnvyCount;
  }
}
