import { MetricCalculator } from '../../Core/MetricCalculator';

import { FolderExtractComponentsFromCode } from '../../Extractors/FolderExtractComponentsFromCode';

import { ClassInfo } from '../../Interface/ClassInfo';
import { MethodInfo } from '../../Interface/MethodInfo';
import { FieldInfo } from '../../Interface/FieldInfo';



export class JavaWeightedMethodCount extends MetricCalculator {

    calculate(node: any, FECFC: FolderExtractComponentsFromCode, Filename: string): number {
        let allClasses: ClassInfo[] = [];
        let allMethods: MethodInfo[] = [];
        let allFields: FieldInfo[] = [];

        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);

        if (fileParsedComponents) {
            const classGroups = fileParsedComponents.classes;
            classGroups.forEach((classGroup) => {
                allClasses = allClasses.concat(classGroup.classes);
                allMethods = allMethods.concat(classGroup.methods);
                allFields = allFields.concat(classGroup.fields);
            });
        }

        return this.calculateWeightedMethodCount(allMethods);
    }

    private calculateWeightedMethodCount(methods: MethodInfo[]): number {
        let complexity = 0;

        methods.forEach((method) => {
            if (method.methodBody.length > 0) {
                complexity++;

                method.methodBody.forEach((statement) => {
                    if (
                        statement === "if_statement" ||
                        statement === "while_statement" ||
                        statement === "do_statement" ||
                        statement === "case" ||
                        statement === "for_statement" ||
                        statement === "condition" ||
                        statement === "ternary_expression"
                    ) {
                        complexity++;
                    }
                });

            }
        });

        return complexity;
    }
}
