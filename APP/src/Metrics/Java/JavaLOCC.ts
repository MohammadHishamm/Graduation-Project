import { MetricCalculator } from '../../Core/MetricCalculator';
import { FileExtractComponentsFromCode } from '../../Extractors/FileExtractComponentsFromCode';
import { ClassInfo } from '../../Interface/ClassInfo';

export class JavaLOCMetric extends MetricCalculator {
    
    calculate(node: any): number {
        const extractor = new FileExtractComponentsFromCode();
        const extractedClasses: ClassInfo[] = extractor.extractClasses(node);

        if (!extractedClasses || extractedClasses.length === 0) {
            console.warn("Warning: No classes extracted from the file.");
            return 0;
        }

        let totalLOCC = 0;

        extractedClasses.forEach((classInfo: ClassInfo) => {
            if (!classInfo.startPosition || !classInfo.endPosition) {
                console.warn(`Warning: Missing position data in class ${classInfo.name}`);
                return;
            }

            const startLine = classInfo.startPosition.row;
            const endLine = classInfo.endPosition.row;
            totalLOCC += (endLine - startLine + 1);
        });

        return totalLOCC+1;
    }
}
