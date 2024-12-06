import * as vscode from 'vscode';


export class isSupportedFileType {

    constructor(private document: vscode.TextDocument){};

    public isSupported(): boolean {
        const fileType = this.document.languageId;
        const supportedFileTypes = ["java", "python"];

        if (supportedFileTypes.includes(fileType)) {
            return true;
        } else {
            vscode.window.showWarningMessage(`Unsupported file type: ${fileType}`);
            return false;
        }
    }
}