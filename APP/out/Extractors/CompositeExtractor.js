"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompositeExtractor = void 0;
const ClassExtractor_1 = require("./ClassExtractor");
const MethodExtractor_1 = require("./MethodExtractor");
const FieldExtractor_1 = require("./FieldExtractor");
class CompositeExtractor {
    extractClassGroup(rootNode, fileName) {
        // Extract class declarations
        let classNodes = rootNode.descendantsOfType("class_declaration");
        const interfaceNodes = rootNode.descendantsOfType("interface_declaration");
        // Handle cases where no classes are found
        if (classNodes.length === 0) {
            if (interfaceNodes.length !== 0) {
                classNodes = interfaceNodes;
            }
            else {
                console.warn(`No Data found in file: ${fileName}`);
                return [];
            }
        }
        const classextractor = new ClassExtractor_1.ClassExtractor();
        const methodextractor = new MethodExtractor_1.MethodExtractor();
        const fieldextractor = new FieldExtractor_1.FieldExtractor();
        // Extract classes, methods, and fields
        const classes = classextractor.extractClasses(rootNode);
        const methods = methodextractor.extractMethods(rootNode, classes);
        const fields = fieldextractor.extractFields(rootNode, methods);
        // Map class nodes into ClassGroup objects
        return classNodes.map((node) => ({
            fileName: fileName,
            name: node.childForFieldName("name")?.text ?? "Unknown",
            classes: classes,
            methods: methods,
            fields: fields,
        }));
    }
}
exports.CompositeExtractor = CompositeExtractor;
//# sourceMappingURL=CompositeExtractor.js.map