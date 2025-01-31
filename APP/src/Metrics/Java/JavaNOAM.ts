import { MetricCalculator } from "../../Core/MetricCalculator";

import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";

import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
import { MethodInfo } from "../../Interface/MethodInfo";

export class JavaNumberOfAccessorMethods extends MetricCalculator {
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
          allClasses = allClasses.concat(classGroup.classes);
          allMethods = allMethods.concat(classGroup.methods);
          allFields = allFields.concat(classGroup.fields);
        });
      }
      
    const NOAM = this.findaccessedmethods(allMethods);

    return NOAM;
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
