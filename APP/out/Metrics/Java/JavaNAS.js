"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaNumberOfAddedServices = void 0;
const MetricCalculator_1 = require("../../Core/MetricCalculator");
const ExtractComponentsFromCode_1 = require("../../Extractors/ExtractComponentsFromCode");
const FolderExtractComponentsFromCode_1 = require("../../Extractors/FolderExtractComponentsFromCode");
class JavaNumberOfAddedServices extends MetricCalculator_1.MetricCalculator {
    // Return a Promise from calculate
    calculate(node) {
        const extractcomponentsfromcode = new ExtractComponentsFromCode_1.ExtractComponentsFromCode();
        const Classes = extractcomponentsfromcode.extractClasses(node);
        const methods = extractcomponentsfromcode.extractMethods(node, Classes);
        return this.findNAS(methods, node);
    }
    findNAS(methods, rootNode) {
        let NAS = 0;
        let FECFcode = new FolderExtractComponentsFromCode_1.FolderExtractComponentsFromCode();
        let extendedClass;
        // Await the result of the asynchronous method to get the array of FileParsedComponents
        FECFcode.parseAllJavaFiles();
        const fileParsedComponents = FECFcode.getParsedComponentsFromFile();
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
            for (const method of methods) {
                if (method.isOverridden) {
                    let found = false;
                    for (const fileComponents of fileParsedComponents) {
                        for (const classGroup of fileComponents.classes) {
                            if (extendedClass === classGroup.name) {
                                for (const classMethod of classGroup.methods) {
                                    if (classMethod.name === method.name) {
                                        found = true;
                                    }
                                }
                            }
                        }
                    }
                    if (!found) {
                        NAS++;
                    }
                }
                else {
                    if (method.modifiers.includes('public') && // Only public methods
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
                if (method.modifiers.includes('public') && // Only public methods
                    !method.isConstructor && // Exclude constructors
                    !method.isAccessor // Exclude getters and setters
                ) {
                    NAS++;
                }
            }
        }
        return NAS;
    }
}
exports.JavaNumberOfAddedServices = JavaNumberOfAddedServices;
//# sourceMappingURL=JavaNAS.js.map