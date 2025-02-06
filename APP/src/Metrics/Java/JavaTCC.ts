import { MetricCalculator } from "../../Core/MetricCalculator";

import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";

import { ClassInfo } from "../../Interface/ClassInfo";
import { MethodInfo } from "../../Interface/MethodInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
export class TCCCalculation extends MetricCalculator {
  calculate(node: any,  FECFC: FolderExtractComponentsFromCode, Filename: string): number 
  { 

    let allMethods: MethodInfo[] = [];
    let allFields: FieldInfo[] = [];

    const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);

    if (fileParsedComponents) 
    {
      const classGroups = fileParsedComponents.classes;
      classGroups.forEach((classGroup) => 
      {
        allMethods = allMethods.concat(classGroup.methods);
        allFields = allFields.concat(classGroup.fields);
      });
    }
    

    const  TCC= this.calculateTCC(
      allMethods,
      allFields
    );

    return TCC;
  }

  // Simulate field usage extraction for a method
  private calculateTCC(
    methods: MethodInfo[],
    fields: FieldInfo[]
  ): number {
    let pairs = 0;
  
    // Iterate through all methods
    for (let i = 0; i < methods.length; i++) {
      if (!methods[i].isConstructor) {
        const methodA = methods[i];
        const fieldsA = methodA.fieldsUsed;
  
        let key = true;
  
        // Compare methodA with all other methods
        for (let j = 0; j < methods.length; j++) {
          if (!methods[j].isConstructor && methodA.name !== methods[j].name) {
            const methodB = methods[j];
            const fieldsB = methodB.fieldsUsed;
  
            // Check for any shared field
            for (const field of fieldsA) {
              if (fieldsB.includes(field) && key) {
                console.log(`Shared field found between ${methodA.name} and ${methodB.name}: ${field}`);
                // Find the field in the class fields
                for (const classField of fields) {
                  if (classField.name === field) {
                    pairs++; // Increment the pair count when a shared field is found
                    key = false; // Only count once per pair
                    break;
                  }
                }
              }
            }
          }
  
          if (!key) {
            break; // Exit the loop early once a shared field is found for this pair
          }
        }
      }
    }
  
    const nummeth = methods.length; //number of methods
  
    // Calculate TCC: 2 * pairs / (n_methods * (n_methods - 1))
    const tcc = (2 * pairs) / (nummeth * (nummeth - 1));
  
    // Handle edge cases where there are fewer than 2 methods
    if (nummeth <= 1) {
      return 0;
    } else {
      console.log(`TCC Calculation: pairs = ${pairs}, nummeth = ${nummeth}, TCC = ${tcc}`);
      return parseFloat(tcc.toFixed(2));
    }
  }
  
  
}
