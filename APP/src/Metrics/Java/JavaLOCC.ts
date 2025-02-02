import { MetricCalculator } from '../../Core/MetricCalculator';
import { FolderExtractComponentsFromCode } from '../../Extractors/FolderExtractComponentsFromCode';

import { ClassInfo } from '../../Interface/ClassInfo';
import { FieldInfo } from '../../Interface/FieldInfo';
import { MethodInfo } from '../../Interface/MethodInfo';

export class JavaLOCMetric extends MetricCalculator {
    
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
          allClasses = [...allClasses, ...classGroup.classes];
          allMethods = [...allMethods, ...classGroup.methods];
          allFields = [...allFields, ...classGroup.fields];
        });
      }

        if (!allClasses || allClasses.length === 0) {
            console.warn("Warning: No classes extracted from the file.");
            return 0;
        }

        let totalLOCC = 0;

        allClasses.forEach((classInfo: ClassInfo) => {
            if (!classInfo.startPosition || !classInfo.endPosition) {
                console.warn(`Warning: Missing position data in class ${classInfo.name}`);
                return;
            }

            const startLine = classInfo.startPosition.row;
            const endLine = classInfo.endPosition.row;
            totalLOCC += (endLine - startLine + 1);
        });

        return totalLOCC;
    }
}
