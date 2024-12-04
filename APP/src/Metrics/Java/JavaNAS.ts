import Parser from 'tree-sitter';

import { FolderExtractComponentsFromCode } from '../../Core/FECFCode';
import { MetricCalculator } from '../../Core/MetricCalculator';
import { ClassInfo, FieldInfo, MethodInfo } from '../../Interface/ParsedComponents';

export class JavaNumberOfAddedServices extends MetricCalculator {


    calculate(node: any): number {
        return this.extractComponents(node.tree);
    }

    // Extract components and calculate ATFD
    extractComponents(tree: Parser.Tree): number {
        const rootNode = tree.rootNode;

        const classes = this.extractClasses(rootNode);
        const methods = this.extractMethods(rootNode, classes);

        this.findNAS(methods, rootNode).then((number) => {
            console.log( "NAS:" , number);
        });

        // Return the count of distinct foreign classes
        return 0;
    }

    private extractClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {
        const classNodes = rootNode.descendantsOfType('class_declaration');
        return classNodes.map((node) => {
            // Find the class name
            const className = node.childForFieldName('name')?.text ?? 'Unknown';

            // Check if the class extends another class
            const extendsNode = node.childForFieldName('extends');
            const extendedClass = extendsNode ? extendsNode.text : null;


            // Return the class information along with inheritance details
            return {
                name: className,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }

    private extractMethods(rootNode: Parser.SyntaxNode, classes: ClassInfo[]): MethodInfo[] {
        const methodNodes = rootNode.descendantsOfType('method_declaration');
        return methodNodes.map((node) => {
            // Dynamically find modifiers as a child node
            const modifiersNode = node.children.find((child) => child.type === 'modifiers');
            const modifiers = modifiersNode ? modifiersNode.text : '';

            // Check if the method is overridden by looking for '@Override' in the modifiers
            const isOverridden = modifiers.includes('@Override');

            // Remove '@Override' and 'static' from the modifiers to focus on the access modifier only
            let accessModifier = modifiers.replace('@Override', '').replace('static', '').trim();

            // Determine the access modifier
            if (accessModifier.includes('public')) {
                accessModifier = 'public';
            } else if (accessModifier.includes('private')) {
                accessModifier = 'private';
            } else if (accessModifier.includes('protected')) {
                accessModifier = 'protected';
            } else {
                accessModifier = 'public';  // Default to public if no access modifier is found
            }

            const name = node.childForFieldName('name')?.text ?? 'Unknown';
            const params = node.childForFieldName('parameters')?.text ?? '';
            const parentClass = this.findParentClass(node, classes);

            const isConstructor = parentClass ? parentClass.name === name : false;
            const isAccessor = this.isAccessor(name);

            return {
                name,
                modifiers: accessModifier,  // Only 'public', 'private', or 'protected' are kept
                isConstructor,
                isAccessor,
                isOverridden,  // Add the isOverridden field to the return value
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }




    private extractFields(rootNode: Parser.SyntaxNode, classes: ClassInfo[]): FieldInfo[] {
        // Find all the field declaration nodes in the syntax tree
        const fieldNodes = rootNode.descendantsOfType('field_declaration');

        return fieldNodes.map((node) => {
            // Log node to inspect its children (useful for debugging)
            // console.log('Field Node:', node.toString());

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
                type,
                modifiers,
                startPosition: node.startPosition,
                endPosition: node.endPosition,
            };
        });
    }


    private async findNAS(methods: MethodInfo[], rootNode: Parser.SyntaxNode): Promise<number> {
        let NAS = 0;
        let FECFcode = new FolderExtractComponentsFromCode();
        let extendedClass;
        // Await the result of the asynchronous method to get the array of FileParsedComponents
        const fileParsedComponents = await FECFcode.parseAllJavaFiles();


        const classNodes = rootNode.descendantsOfType('class_declaration');
        classNodes.forEach((node) => {
            // Try to find the 'superclass' node
            const extendsNode = node.childForFieldName('superclass');
        
            if (extendsNode) {
                // Extract the text and trim 'extends' from the start
                extendedClass = extendsNode.text.trim().replace(/^extends\s*/, ''); 
            }
        });
        
        if (extendedClass) {

            
            for (const method of methods) 
            {
                if(method.isOverridden)
                {
                    let found = false;
                    for (const fileComponents of fileParsedComponents) {
                        for (const classGroup of fileComponents.classes) {
                            if (extendedClass === classGroup.name) {
                                for (const classMethod of classGroup.methods) {
                                    if (classMethod.name === method.name)
                                    {
                                        found = true;
                                    }
                                }
                            }
                        }
                    }

                    if(!found)
                    {
                        NAS++;
                    }
                }
                else
                {
                    if(
                        method.modifiers.includes('public') && // Only public methods
                        !method.isConstructor && // Exclude constructors
                        !method.isAccessor // Exclude getters and setters
                    ) {
                        NAS++;
                    }
                }
            }
        }
        else {

            for (const method of methods) {
                if (
                    method.modifiers.includes('public') && // Only public methods
                    !method.isConstructor && // Exclude constructors
                    !method.isAccessor // Exclude getters and setters
                ) {
                    NAS++;
                }
            }
        }

        return NAS;
    }



    private findParentClass(node: Parser.SyntaxNode, classes: ClassInfo[]): ClassInfo | null {
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
        // Check for getter or setter patterns (case-insensitive)
        const isGetter = /^get[A-Za-z]/.test(methodName);
        const isSetter = /^set[A-Za-z]/.test(methodName);

        return isGetter || isSetter;
    }
}
