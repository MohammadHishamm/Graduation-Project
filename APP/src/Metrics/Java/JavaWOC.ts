import { MetricCalculator } from '../../Core/MetricCalculator';
import { ExtractComponentsFromCode } from '../../Extractors/ExtractComponentsFromCode';
import { FileParsedComponents } from '../../Interface/FileParsedComponents';
import { MethodInfo, FieldInfo } from '../../Interface/ParsedComponents';


export class JavaWeightOfAClass extends MetricCalculator {

    calculate(node: any): number {
        const extractcomponentsfromcode = new ExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const methods = extractcomponentsfromcode.extractMethods(node, Classes);
        const Fields = extractcomponentsfromcode.extractFields(node, Classes);
        const filteredFields = extractcomponentsfromcode.filterPublicNonEncapsulatedFields(Fields, methods);
        const WOC = this.calculateWeight(methods, filteredFields);

        return WOC;
    }


    // Calculate the weight of the class
    private calculateWeight(methods: MethodInfo[], fields: FieldInfo[]): number {
        let nom = 0; // Numerator: public methods (non-constructor and non-accessor) + public attributes
        let den = 0; // Denominator: public methods that are not accessors

        methods.forEach(method => {


            if (!method.isConstructor && method.modifiers.includes('public')) {
                ++nom;
                if (method.isAccessor) {
                    ++den;
                }
            }
        });

        fields.forEach(field => {
            if (field.modifiers.includes('public')) {
                ++nom;
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
