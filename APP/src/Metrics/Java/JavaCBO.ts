// import { MetricCalculator } from '../../Core/MetricCalculator';
// import { FileExtractComponentsFromCode } from '../../Extractors/FileExtractComponentsFromCode';
// import { FolderExtractComponentsFromCode } from '../../Extractors/FolderExtractComponentsFromCode';
// import { ClassInfo } from '../../Interface/ClassInfo';

// export class JavaCouplingBetweenObjects extends MetricCalculator 
// {
//     calculate(node: any): number {
//          const extractor = new FileExtractComponentsFromCode();
//          const extractedClasses: ClassInfo[] = extractor.extractClasses(node);
         

//          if (!extractedClasses || extractedClasses.length === 0) {
//             console.warn("Warning: No classes extracted from the file.");
//             return 0;
//         }

//         let totalCBO = 0;

//         extractedClasses.forEach((classInfo: ClassInfo) => {
//             const dependencies = new Set<string>();

//             if (!classInfo.references || classInfo.references.length === 0) {
//                 console.warn(`Warning: No dependencies found for class ${classInfo.name}`);
//                 return;
//             }

//             classInfo.references.forEach((refClass: string) => {
//                 if (refClass !== classInfo.name) { // Ensure it does not count itself
//                     dependencies.add(refClass);
//                 }
//             });

//             totalCBO += dependencies.size;
//         });

//         return totalCBO;
        


        




        
//     }
  
    
    


// }


