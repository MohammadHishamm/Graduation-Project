import Parser from 'tree-sitter';

import { MetricCalculator } from '../../Core/MetricCalculator';
import { ParsedComponents, ClassInfo, MethodInfo, FieldInfo } from '../../Interface/ParsedComponents';

export class JavaNumberOfAddedServices extends MetricCalculator 
{
    calculate(node: any): number {
        return this.extractComponents(node.tree);
    }

    // Extract components and calculate ATFD
    extractComponents(tree: Parser.Tree): number {
        const rootNode = tree.rootNode;

        const classes = this.extractClasses(rootNode);
        const methods = this.extractMethods(rootNode , classes);

        // Identify foreign field accesses
        const NAS = this.findNAS(methods);

        // Return the count of distinct foreign classes
        return NAS;
    }

    private extractClasses(rootNode: Parser.SyntaxNode): ClassInfo[] {
        const classNodes = rootNode.descendantsOfType('class_declaration');
        return classNodes.map((node) => ({
            name: node.childForFieldName('name')?.text ?? 'Unknown',
            startPosition: node.startPosition,
            endPosition: node.endPosition,
        }));
    }

    private extractMethods(rootNode: Parser.SyntaxNode, classes: ClassInfo[]): MethodInfo[] {
        const methodNodes = rootNode.descendantsOfType('method_declaration');
        return methodNodes.map((node) => {
            // Dynamically find modifiers as a child node
            const modifiersNode = node.children.find((child) => child.type === 'modifiers');
            const modifiers = modifiersNode ? modifiersNode.text : '';
    
            // Check if the method is overridden by looking for '@Override' in the modifiers
            const isOverridden = modifiers.includes('@Override');
    
            // Strip '@Override' and keep only the access modifier (e.g., 'public')
            const accessModifier = modifiers.replace('@Override', '').trim().split(' ')[0];
    
            const name = node.childForFieldName('name')?.text ?? 'Unknown';
            const params = node.childForFieldName('parameters')?.text ?? '';
            const parentClass = this.findParentClass(node, classes);
    
            const isConstructor = parentClass ? parentClass.name === name : false;
            const isAccessor = this.isAccessor(name);
    
            return {
                name,
                modifiers: accessModifier, // Use only the access modifier (e.g., 'public')
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


    private findNAS(methods: MethodInfo[]): number {
        let NAS = 0;

        for (const method of methods) {
            if (
                method.modifiers.includes('public') && // Only public methods
                !method.isOverridden && // Exclude overridden methods
                !method.isConstructor && // Exclude constructors
                !method.isAccessor // Exclude getters and setters
            ) {
                NAS++;
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


    private isAccessor(methodName: string): boolean 
    {
        // Check for getter or setter patterns
        const isGetter = /^get[A-Z]/.test(methodName);
        const isSetter = /^set[A-Z]/.test(methodName);

        return isGetter || isSetter;
    }
}
