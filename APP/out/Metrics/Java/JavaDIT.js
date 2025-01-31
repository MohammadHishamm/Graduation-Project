"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaDepthOfInheritanceTree = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaDepthOfInheritanceTree extends MetricCalculator_1.MetricCalculator {
    // Return a Promise from calculate
    calculate(node, sourceCode, FECFC, Filename) {
        let allClasses = [];
        let allMethods = [];
        let allFields = [];
        const fileParsedComponents = FECFC.getParsedComponentsByFileName(Filename);
        if (fileParsedComponents) {
            const classGroups = fileParsedComponents.classes;
            classGroups.forEach((classGroup) => {
                allClasses = [...allClasses, ...classGroup.classes];
                allMethods = [...allMethods, ...classGroup.methods];
                allFields = [...allFields, ...classGroup.fields];
            });
        }
        return this.findDIT(allClasses, node, FECFC);
    }
    findDIT(Classes, rootNode, FECFC) {
        let DIT = 0;
        let isExtended;
        let isinterface;
        const fileParsedComponents = FECFC.getParsedComponentsFromFile();
        // Loop through Classes to identify the extended class
        for (const c of Classes) {
            isExtended = c.parent; // The class that extends another class
            isinterface = c.isInterface; // is interface class
        }
        // If the class has an extended class (i.e., it's not a root class) and not an interface 
        if (isExtended && !isinterface) {
            // Loop through the parsed components of the file
            for (const fileComponents of fileParsedComponents) {
                // Loop through class groups to find matching extended class
                for (const classGroup of fileComponents.classes) {
                    if (isExtended === classGroup.name) {
                        // If the class name matches the extended class, increment DIT
                        DIT++;
                        // Recursively traverse through subclasses (if they exist)
                        for (const classInfo of classGroup.classes) {
                            if (classInfo.parent) {
                                // Recursively call findDIT to calculate DIT for subclass
                                DIT += this.findDIT([classInfo], rootNode, FECFC);
                            }
                        }
                    }
                }
            }
        }
        return DIT;
    }
}
exports.JavaDepthOfInheritanceTree = JavaDepthOfInheritanceTree;
//# sourceMappingURL=JavaDIT.js.map