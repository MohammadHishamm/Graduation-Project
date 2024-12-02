import Parser from 'tree-sitter';
import { ParsedComponents, ClassInfo, MethodInfo, FieldInfo } from '../Interface/ParsedComponents'; // Import the interfac

//TODO 
// for the future
export class ExtractComponentsFromCode 
{
    // Extract components and classify methods
    extractComponents(tree: Parser.Tree): ParsedComponents {
        const rootNode = tree.rootNode;

        const classes = this.extractClasses(rootNode);
        const methods = this.extractMethods(rootNode, classes);
        const fields = this.extractFields(rootNode, classes);

        const filteredFields = this.filterPublicNonEncapsulatedFields(fields, methods);
        const weight = this.calculateWeight(methods, filteredFields);

        return {
            classes,
            methods,
            fields,
            weight,
        };
    }

    public extractClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {
        const classNodes = rootNode.descendantsOfType('class_declaration');
        return classNodes.map((node) => ({
            name: node.childForFieldName('name')?.text ?? 'Unknown',
            startPosition: node.startPosition,
            endPosition: node.endPosition,
        }));
    }
    public extractMethods(rootNode: Parser.SyntaxNode, classes: ClassInfo[]): MethodInfo[] {
        const methodNodes = rootNode.descendantsOfType('method_declaration');
        return methodNodes.map((node) => {
            // Dynamically find modifiers as a child node
            const modifiersNode = node.children.find((child) => child.type === 'modifiers');
            const modifiers = modifiersNode ? modifiersNode.text : '';

            const name = node.childForFieldName('name')?.text ?? 'Unknown';
            const params = node.childForFieldName('parameters')?.text ?? '';
            const parentClass = this.findParentClass(node, classes);

            const isConstructor = parentClass ? parentClass.name === name : false;
            const isAccessor = this.isAccessor(name);

            return {
                name,
                modifiers,
                isConstructor,
                isAccessor,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }

    public extractFields(rootNode: Parser.SyntaxNode, classes: ClassInfo[]): FieldInfo[] {
        // Find all the field declaration nodes in the syntax tree
        const fieldNodes = rootNode.descendantsOfType('field_declaration');

        return fieldNodes.map((node) => {
            // Log node to inspect its children (useful for debugging)
            console.log('Field Node:', node.toString());

            // The modifiers are usually on the first child (public, private, etc.)
            const modifiersNode = node.child(0); // Use child(0) to access the first child
            const modifiers = modifiersNode ? modifiersNode.text : '';

            // The type of the field (like int, String)
            const typeNode = node.child(1); // Access second child for the type
            const type = typeNode ? typeNode.text : '';

            // The name of the field is usually the third child
            const nameNode = node.child(2); // Access third child for the name
            const name = nameNode ? nameNode.text : 'Unknown';



            // Return the field information
            return {
                name,
                modifiers,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }


    public filterPublicNonEncapsulatedFields(fields: FieldInfo[], methods: MethodInfo[]): FieldInfo[] {
        return fields.filter(field => field.modifiers.includes('public') && !this.hasGetterSetter(field.name, methods));
    }



    // Check if the field has getter or setter methods
    public hasGetterSetter(fieldName: string, methods: MethodInfo[]): boolean {
        const getterPattern = new RegExp(`get${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}\\(`);
        const setterPattern = new RegExp(`set${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}\\(`);

        return methods.some(method => getterPattern.test(method.name) || setterPattern.test(method.name));
    }


    // Calculate the weight of the class
    public calculateWeight(methods: MethodInfo[], fields: FieldInfo[]): number {
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

        console.log(`${den}`);
        console.log(`${nom}`);
        let x: number;
        x = den / nom;
        return 1 - x;
    }


    public findParentClass(node: Parser.SyntaxNode, classes: ClassInfo[]): ClassInfo | null {
        for (const cls of classes) {
            if (
                node.startPosition.row >= cls.startPosition.row &&
                node.endPosition.row <= cls.endPosition.row
            ) {
                return cls;
            }
        }
        return null;
    }

    public isAccessor(methodName: string): boolean {
        // Check for getter or setter patterns
        const isGetter = /^get[A-Z]/.test(methodName);
        const isSetter = /^set[A-Z]/.test(methodName);

        return isGetter || isSetter;
    }
}


