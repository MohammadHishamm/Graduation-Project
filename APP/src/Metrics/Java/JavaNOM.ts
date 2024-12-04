import { MetricCalculator } from '../../Core/MetricCalculator';

export class JavaNumberOfMethodsMetric extends MetricCalculator {
    calculate(node: any): number {
        let methodCount = 0;
 
            const traverse = (currentNode: any) => {
                // Check if the current node represents a class declaration

                
                if (currentNode.type === 'class_declaration') {
                    // Traverse only the class's body to count field declarations
                    const classBody = currentNode.children.find((child: any) => child.type === 'class_body');
                    if (classBody && classBody.children) {
                        for (const child of classBody.children) {
                            if (child.type === 'method_declaration' || child.type === 'constructor_declaration' ) 
                            {
                                methodCount++;
                            }
                        }
                    }
                }
    
                // Avoid traversing deeper into nested methods or irrelevant nodes
                if (currentNode.children) {
                    for (const child of currentNode.children) {
                        traverse(child);
                    }
                }
            };
        

        traverse(node); // Start with isInsideClass as false
        return methodCount;
    }
}
