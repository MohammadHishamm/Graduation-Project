import { MetricCalculator } from '../../Core/MetricCalculator';
import { FileExtractComponentsFromCode } from '../../Extractors/FileExtractComponentsFromCode';
import { ClassInfo } from '../../Interface/ClassInfo';

export class JavaCouplingBetweenObjects extends MetricCalculator {
    calculate(node: any): number {
        const extractor = new FileExtractComponentsFromCode();
        const extractedClasses: ClassInfo[] = extractor.extractClasses(node);

        if (!extractedClasses || extractedClasses.length === 0) {
            console.warn("Warning: No classes extracted from the file.");
            return 0;
        }

        let totalCBO = 0;

        extractedClasses.forEach((classInfo: ClassInfo) => {
            // const paraRetTypesCount = this.para_retTypesCount(classInfo);
            // const accessTypesCount = this.accessTypesCount(classInfo);
            // const callTypesCount = this.callTypesCount(classInfo);

            // Combine the results of the three metrics
            const cboForClass = new Set([
                // ...paraRetTypesCount,
                // ...accessTypesCount,
                // ...callTypesCount,
            ]);

            totalCBO += cboForClass.size;
        });

        return totalCBO;
    }

    // private para_retTypesCount(classInfo: ClassInfo): Set<string> {
    //     const uniqueTypes = new Set<string>();
    //     const { methods } = classInfo;

    //     methods.forEach((method) => {
    //         // Extract parameter types
    //         const paramTypes = method.params.match(/[\w.$]+/g) || [];
    //         paramTypes.forEach((type) => uniqueTypes.add(type));

    //         // Extract return type
    //         const returnTypeMatch = method.modifiers.match(/(?:[\w.$]+)\s+\w+\(/);
    //         if (returnTypeMatch) {
    //             const returnType = returnTypeMatch[0];
    //             uniqueTypes.add(returnType);
    //         }
    //     });

    //     return uniqueTypes;
    // }

    // private accessTypesCount(classInfo: ClassInfo): Set<string> {
    //     const uniqueTypes = new Set<string>();
    //     const { fields, methods } = classInfo;

    //     fields.forEach((field) => {
    //         uniqueTypes.add(field.type);
    //     });

    //     methods.forEach((method) => {
    //         method.fieldsUsed.forEach((field) => {
    //             uniqueTypes.add(field);
    //         });
    //     });

    //     return uniqueTypes;
    // }

    // private callTypesCount(classInfo: ClassInfo): Set<string> {
    //     const uniqueTypes = new Set<string>();
    //     const { methods } = classInfo;

    //     methods.forEach((method) => {
    //         const methodBody = method.body;
    //         if (methodBody) {
    //             const callMatches = methodBody.match(/[\w.$]+\(/g) || [];
    //             callMatches.forEach((call) => {
    //                 const className = call.split(".")[0];
    //                 uniqueTypes.add(className);
    //             });
    //         }
    //     });

    //     return uniqueTypes;
    // }
}
