import Parser from "tree-sitter";

import { MetricCalculator } from "../../Core/MetricCalculator";
import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
import { MethodInfo } from "../../Interface/MethodInfo";

export class JavaDepthOfInheritanceTree extends MetricCalculator {
  // Return a Promise from calculate
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


    return this.findDIT(allClasses, node, FECFC);
  }

  private findDIT(
    MyClasses: ClassInfo[],
    rootNode: Parser.SyntaxNode,
    FECFC: FolderExtractComponentsFromCode
): number {
    let DIT = 0;
    let isExtended; 
    let isinterface;

    // Loop through Classes to identify the extended class
    for (const c of MyClasses) {
        isExtended = c.parent; // The class that extends another class
        isinterface = c.isInterface; // is interface class
    }

    // If the class has an extended class (i.e., it's not a root class) and not an interface 
    if (isExtended && !isinterface ) 
    {
        console.log(isExtended);

        let allClasses: ClassInfo[] = [];
        let allMethods: MethodInfo[] = [];
        let allFields: FieldInfo[] = [];
    
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(isExtended);
    
        if (fileParsedComponents) 
        {
          DIT++;

          const classGroups = fileParsedComponents.classes;
          classGroups.forEach((classGroup) => 
          {
            allClasses = [...allClasses, ...classGroup.classes];
            allMethods = [...allMethods, ...classGroup.methods];
            allFields = [...allFields, ...classGroup.fields];
          });


          allClasses.forEach((Classes) => {
            if (Classes.parent) {
                // Recursively call findDIT to calculate DIT for subclass
                DIT += this.findDIT([Classes], rootNode, FECFC);
            }
          });
        }

    }

    return DIT;
}
}