import { MetricCalculator } from '../../Core/MetricCalculator';

export class PythonNumberofAttributesMetric extends MetricCalculator {
    calculate(node: any): number {
        let numberOfAttributes = 0;
        let classTrigger = false;
        
        const traverse = (currentNode: any) => {
            console.log(`${currentNode.type}`);
            // Check if the current node represents a class declaration
            if (currentNode.type === 'class_definition'  ) 
            {
                classTrigger = true;
            }

            if(currentNode.type === 'function_definition' )
            {
                classTrigger = false;
            }

            if(currentNode.type === 'assignment' && classTrigger)
            {
                numberOfAttributes++;
            }
      
      
            // Recursively traverse the children nodes
            if (currentNode.children) {
                currentNode.children.forEach((child: any) => traverse(child));
            }
        };

        traverse(node);
        return numberOfAttributes;  // Return the total number of class-level attributes
    }
}
