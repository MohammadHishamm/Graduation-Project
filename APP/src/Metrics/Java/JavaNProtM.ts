import { MetricCalculator } from '../../Core/MetricCalculator';
import { FolderExtractComponentsFromCode } from '../../Extractors/FolderExtractComponentsFromCode';
import { ClassInfo } from '../../Interface/ClassInfo';
import { FieldInfo } from '../../Interface/FieldInfo';
import { MethodInfo } from '../../Interface/MethodInfo';

export class JavaNumberOfProtectedMethods extends MetricCalculator {
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
      
    const NProtM = this.claculateNumberOfProtectedMethods(allMethods);

    return NProtM;
  }

  private claculateNumberOfProtectedMethods(Methods: MethodInfo[]): number {
    let NProtM = 0; // Initialize DAC counter

    for (const Method of Methods) {
      if (Method.modifiers.includes("protected")) {
        NProtM++;
      }
    }

    return NProtM; // Return the final count
  }
}
