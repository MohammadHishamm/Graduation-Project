import Parser from "tree-sitter";

import { MetricCalculator } from "../../Core/MetricCalculator";

import { FolderExtractComponentsFromCode } from "../../Extractors/FolderExtractComponentsFromCode";

import { MethodInfo } from "../../Interface/MethodInfo";
import { ClassInfo } from "../../Interface/ClassInfo";
import { FieldInfo } from "../../Interface/FieldInfo";

export class JavaNumberOfAddedServices extends MetricCalculator {
  // Return a Promise from calculate
  calculate(
    node: any,
    FECFC: FolderExtractComponentsFromCode,
    Filename: string
  ): number {
    let allClasses: ClassInfo[] = [];
    let allMethods: MethodInfo[] = [];
    let allFields: FieldInfo[] = [];

    const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);

    if (fileParsedComponents) {
      const classGroups = fileParsedComponents.classes;
      classGroups.forEach((classGroup) => {
        allClasses = [...allClasses, ...classGroup.classes];
        allMethods = [...allMethods, ...classGroup.methods];
        allFields = [...allFields, ...classGroup.fields];
      });
    }

    return this.findNAS(allClasses, allMethods, FECFC);
  }

  private findNAS(
    classes: ClassInfo[],
    methods: MethodInfo[],
    FECFC: FolderExtractComponentsFromCode
  ): number {
    let NAS = 0;

    // Exit early if no classes or no parent class
    const parentClass = classes[0]?.parent;
    if (!parentClass) {
      console.log("[NAS] No parent class found. NAS = 0");
      return 0;
    }

    // Filter methods that are public, not constructors, and not accessors
    const publicNonAccessorMethods = methods.filter((method) => {
      const isPublic = method.modifiers.includes("public");
      const isNotConstructor = !method.isConstructor;
      const isNotAccessor = !method.isAccessor;

      if (isPublic && isNotConstructor && isNotAccessor) {
        console.log(`[NAS] Selected method: ${method.name}`);
        return true;
      } else {
        if (!isPublic)
          {console.log(`[NAS] Skipped method (not public): ${method.name}`);}
        if (!isNotConstructor)
          {console.log(`[NAS] Skipped method (constructor): ${method.name}`);}
        if (!isNotAccessor)
          {console.log(`[NAS] Skipped method (accessor): ${method.name}`);}
        return false;
      }
    });

    // Filter overridden methods
    const overriddenMethods = methods.filter((method) => {
      if (method.isOverridden) {
        console.log(`[NAS] Overridden method: ${method.name}`);
        return true;
      }
      return false;
    });

    // Calculate NAS as count of public methods minus overridden methods
    NAS = publicNonAccessorMethods.length - overriddenMethods.length;

    console.log(
      `[NAS] Public Non-Accessor Methods: ${publicNonAccessorMethods.length}`
    );
    console.log(`[NAS] Overridden Methods: ${overriddenMethods.length}`);
    console.log(`[NAS] Final NAS: ${Math.max(NAS, 0)}`);

    return Math.max(NAS, 0); // Ensure NAS is not negative
  }
}
