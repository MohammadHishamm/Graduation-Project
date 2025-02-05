import { MetricCalculator } from '../../Core/MetricCalculator';

import { FolderExtractComponentsFromCode } from '../../Extractors/FolderExtractComponentsFromCode';

import { ClassInfo } from '../../Interface/ClassInfo';
import { MethodInfo } from '../../Interface/MethodInfo';
import { FieldInfo } from '../../Interface/FieldInfo';



export class JavaWeightedMethodCount extends MetricCalculator {

    calculate(node: any,  FECFC: FolderExtractComponentsFromCode, Filename: string): number 
    {
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

    private calculateWeightedMethodCount(methods: MethodInfo[]): number 
    {
        let complexity = 0;

        methods.forEach((method) => {
            method.methodBody.forEach((statement) => {

                if (
                    statement.includes("if_statement") ||
                    statement.includes("while_statement") ||
                    statement.includes("do_statement") ||
                    statement.includes("case") ||
                    statement.includes("break_statement") ||
                    statement.includes("continue_statement") ||
                    statement.includes("for_statement") ||
                    statement.includes("condition") ||
                    statement.includes("ternary_expression") ||
                    method
                ) {
                    complexity++;
                }
            });
        });

        return complexity;
    }
}
