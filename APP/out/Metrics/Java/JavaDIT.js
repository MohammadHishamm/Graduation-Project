"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepthOfInheritanceTree = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const FileExtractComponentsFromCode_1 = require("../../Extractors/FileExtractComponentsFromCode");
class DepthOfInheritanceTree extends MetricCalculator_1.MetricCalculator {
    // Return a Promise from calculate
    calculate(node, sourceCode, FECFC) {
        const extractcomponentsfromcode = new FileExtractComponentsFromCode_1.FileExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const methods = extractcomponentsfromcode.extractMethods(node, Classes);
        return this.findDIT(Classes, node, FECFC);
    }
    findDIT(Classes, rootNode, FECFC) {
        let DIT = 0;
        let isExtended; // To track the extended class
        const fileParsedComponents = FECFC.getParsedComponentsFromFile(); // Get all parsed file components
        // Loop through Classes to identify the extended class
        for (const c of Classes) {
            isExtended = c.extendedclass; // The class that extends another class
        }
        // If the class has an extended class (i.e., it's not a root class)
        if (isExtended) {
            // Loop through the parsed components of the file
            for (const fileComponents of fileParsedComponents) {
                // Loop through class groups to find matching extended class
                for (const classGroup of fileComponents.classes) {
                    if (isExtended === classGroup.name) {
                        // If the class name matches the extended class, increment DIT
                        DIT++;
                        // Recursively traverse through subclasses (if they exist)
                        for (const classInfo of classGroup.classes) {
                            if (classInfo.extendedclass) {
                                console.log(classInfo);
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
exports.DepthOfInheritanceTree = DepthOfInheritanceTree;
//# sourceMappingURL=JavaDIT.js.map