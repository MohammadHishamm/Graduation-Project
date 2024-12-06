"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupportedFileType = void 0;
const vscode = __importStar(require("vscode"));
class isSupportedFileType {
    document;
    supportedFileTypes;
    constructor(document, supportedFileTypes = ["java", "python"]) {
        this.document = document;
        this.supportedFileTypes = supportedFileTypes;
    }
    ;
    isSupported() {
        const fileType = this.document.languageId;
        if (this.supportedFileTypes.includes(fileType)) {
            return true;
        }
        else {
            vscode.window.showWarningMessage(`Unsupported file type: ${fileType}`);
            return false;
        }
    }
}
exports.isSupportedFileType = isSupportedFileType;
//# sourceMappingURL=SupportedFileTypes.js.map