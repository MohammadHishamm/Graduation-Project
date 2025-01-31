import Parser from "tree-sitter";

import { MetricCalculator } from "../../Core/MetricCalculator";

import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";

import { MethodInfo } from "../../Interface/MethodInfo";
import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";

export class JavaNumberOfAddedServices extends MetricCalculator {
  // Return a Promise from calculate
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


    return this.findNAS(allClasses , allMethods , FECFC);
  }

  private findNAS(
    classes: ClassInfo[],
    methods: MethodInfo[],
    FECFC: FolderExtractComponentsFromCode
  ): number {
    let NAS = 0;
    let isExtended; 
    let isinterface;

    const fileParsedComponents = FECFC.getParsedComponentsFromFile();

    // Loop through Classes to identify the extended class
    for (const c of classes) {
        isExtended = c.parent; // The class that extends another class
        isinterface = c.isInterface; // is interface class
    }


    if (isExtended) {
      for (const method of methods) {
        if (method.isOverridden) {
          let found = false;
          for (const fileComponents of fileParsedComponents) {
            for (const classGroup of fileComponents.classes) {
              if (isExtended === classGroup.name) {
                for (const classMethod of classGroup.methods) {
                  if (classMethod.name === method.name) {
                    found = true;
                  }
                }
              }
            }
          }

          if (!found) {
            NAS++;
          }
        } else {
          if (
            method.modifiers.includes("public") && // Only public methods
            !method.isConstructor && // Exclude constructors
            !method.isAccessor // Exclude getters and setters
          ) {
            NAS++;
          }
        }
      }
    } else {
      for (const method of methods) {
        if (
          method.modifiers.includes("public") && // Only public methods
          !method.isConstructor && // Exclude constructors
          !method.isAccessor // Exclude getters and setters
        ) {
          NAS++;
        }
      }
    }

    return NAS;
  }
}
