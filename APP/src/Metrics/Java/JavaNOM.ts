import { MetricCalculator } from '../../Core/MetricCalculator';

import { FolderExtractComponentsFromCode } from '../../Extractors/FolderExtractComponentsFromCode';

import { ClassInfo } from '../../Interface/ClassInfo';
import { FieldInfo } from '../../Interface/FieldInfo';

import { MethodInfo } from '../../Interface/MethodInfo';

export class JavaNumberOfMethods extends MetricCalculator {

  calculate(node: any,  FECFC: FolderExtractComponentsFromCode, Filename: string): number 
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

      return allMethods.length;
    } 

}
