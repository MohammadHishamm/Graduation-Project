import { MetricCalculator } from '../../Core/MetricCalculator';
import { FileParsedComponents } from '../../Interface/FileParsedComponents';

export class PythonNumberOfMethodsMetric extends MetricCalculator {

    calculate(node: any): number {
        let NumberOfMethods= 0;
        let classTrigger = false;
        
        const traverse = (currentNode: any) => {
            console.log(`${currentNode.type}`);
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_definition'  ) 
            {
                classTrigger = true;
            }

            if(currentNode.type === 'function_definition' && classTrigger)
            {
                NumberOfMethods++;
            }
      
            console.log(`${currentNode.type}`);
            // Recursively traverse the children nodes
            if (currentNode.children) {
                currentNode.children.forEach((child: any) => traverse(child));
            }
        };

        traverse(node);
        return NumberOfMethods;  // Return the total number of class-level attributes
    }
}
