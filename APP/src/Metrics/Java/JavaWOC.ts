import { MetricCalculator } from '../../Core/MetricCalculator';
import * as vscode from 'vscode';

export class JavaWeightOfClassMetric extends MetricCalculator {
    calculate(node: any): number {
        let functionalMethodCount = 0;
        let totalMethodCount = 0;

        const traverse = (currentNode: any) => {
            if (currentNode.type === 'class_declaration') {
                const classBody = currentNode.children.find((child: any) => child.type === 'class_body');
                if (classBody && classBody.children) {
                    for (const child of classBody.children) {
                        if (child.type === 'method_declaration') {
                            totalMethodCount++;

                            const isConstructor = child.text.startsWith(currentNode.text);
                            const isGetterOrSetter = child.text.includes("get") || child.text.includes("set");

                            if (!isConstructor && !isGetterOrSetter) {
                                functionalMethodCount++;
                            }
                        }
                    }
                }
            }

            // Recursively traverse child nodes
            if (currentNode.children) {
                for (const child of currentNode.children) {
                    traverse(child);
                }
            }
        };

        traverse(node);

        // Prevent division by zero
        if (totalMethodCount === 0) {
            return 0;
        }

        return functionalMethodCount / totalMethodCount;
    }
}
