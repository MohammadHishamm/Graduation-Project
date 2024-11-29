import { MetricCalculator } from '../../Core/MetricCalculator';

export class JavaNumberOfAccessorMethods extends MetricCalculator {
    calculate(node: any): number {
        let accessorCounter = 0;
        let valid = false;

        const traverse = (currentNode: any) => {
            // Check if the current node is a class definition
            if (currentNode.type === "class_declaration") {
                valid = true;
            }

            // Count getter and setter methods (functions with 'get' or 'set' prefix)
            if (valid && currentNode.type === 'identifier') 
            {
               
                    if (currentNode.text.includes("get") || currentNode.text.includes("set")) 
                    {
                       
                        accessorCounter++;
                    }
            }


            // Recursively traverse the children nodes
            if (currentNode.children) {
                currentNode.children.forEach((child: any) => traverse(child));
            }
        };

        traverse(node); // Start traversal from the root node
        return accessorCounter;
    }
}
