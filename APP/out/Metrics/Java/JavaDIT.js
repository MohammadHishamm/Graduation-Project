"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaDepthOfInheritanceTree = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
class JavaDepthOfInheritanceTree extends MetricCalculator_1.MetricCalculator {
    // Return a Promise from calculate
    calculate(node, FECFC, Filename) {
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
    findDIT(MyClasses, rootNode, FECFC) {
        let DIT = 0;
        let isExtended;
        let isinterface;
        // Loop through Classes to identify the extended class
        for (const c of MyClasses) {
            isExtended = c.parent; // The class that extends another class
            isinterface = c.isInterface; // is interface class
        }
        // If the class has an extended class (i.e., it's not a root class) and not an interface 
        if (isExtended && !isinterface) {
            console.log(isExtended);
            let allClasses = [];
            let allMethods = [];
            let allFields = [];
            const fileParsedComponents = FECFC.getParsedComponentsByFileName(isExtended);
            if (fileParsedComponents) {
                DIT++;
                const classGroups = fileParsedComponents.classes;
                classGroups.forEach((classGroup) => {
                    allClasses = [...allClasses, ...classGroup.classes];
                    allMethods = [...allMethods, ...classGroup.methods];
                    allFields = [...allFields, ...classGroup.fields];
                });
                allClasses.forEach((Classes) => {
                    if (Classes.parent) {
                        // Recursively call findDIT to calculate DIT for subclass
                        DIT += this.findDIT([Classes], rootNode, FECFC);
                    }
                });
            }
        }
        return DIT;
    }
}
exports.JavaDepthOfInheritanceTree = JavaDepthOfInheritanceTree;
//# sourceMappingURL=JavaDIT.js.map