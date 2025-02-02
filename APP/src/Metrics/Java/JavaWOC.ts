import { MetricCalculator } from "../../Core/MetricCalculator";
import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";
import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";
import { MethodInfo } from "../../Interface/MethodInfo";

export class JavaWeightOfAClass extends MetricCalculator {
  //TODO FECFC , FileParsedComponents
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


    const WOC = this.calculateWeight(allMethods, allFields);

    return WOC;
  }


  private calculateWeight(methods: MethodInfo[], fields: FieldInfo[]): number {
    let nom = 0; // Numerator: public methods (non-constructor and non-accessor) + public attributes
    let den = 0; // Denominator: public methods that are not accessors

    methods.forEach((method) => {
      if (!method.isConstructor && method.modifiers.includes("public")) {
        ++nom;
        if (method.isAccessor) 
        {
          ++den;
        }
      }
    });

    fields.forEach((field) => {
      if (field.modifiers.includes("public") && !field.isEncapsulated ) 
      {
        ++nom;
        ++den;
      }
    });

    if (nom === 0) {
      return 0; // If no valid public elements, return 0
    }

    let x: number;
    x = den / nom;
    return 1 - x;
  }
}
