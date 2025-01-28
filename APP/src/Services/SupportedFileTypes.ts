import * as vscode from 'vscode';


export class isSupportedFileType {
    

    constructor(private document: vscode.TextDocument , private supportedFileTypes = ["java", "python"]){};

    public isSupported(): boolean {
        const fileType = this.document.languageId;
        

        if (this.supportedFileTypes.includes(fileType)) {
            return true;
        } else {
            vscode.window.showWarningMessage(`Unsupported file type: ${fileType}`);
            return false;
        }
    }
}