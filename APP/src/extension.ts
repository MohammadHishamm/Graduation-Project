import * as vscode from 'vscode';

let isActive = true; 

export function activate(context: vscode.ExtensionContext) {

    const activateCommand = vscode.commands.registerCommand('extension.activateCommand', () => {
        if (!isActive) {
            isActive = true;
            vscode.window.showInformationMessage('CodePure Activated!');
        } else {
            vscode.window.showWarningMessage('CodePure is already active!');
        }
    });

    const deactivateCommand = vscode.commands.registerCommand('extension.deactivateCommand', () => {
        if (isActive) {
            isActive = false;
            vscode.window.showInformationMessage('CodePure Deactivated!');
        } else {
            vscode.window.showWarningMessage('CodePure is not active!');
        }
    });

    vscode.workspace.onDidSaveTextDocument((document) => {
        if (isActive && isSupportedFileType(document)) {
            analyzeCode(document.getText());
        }
    });

    vscode.workspace.onDidChangeTextDocument((event) => {
        if (isActive && isSupportedFileType(event.document)) {
            analyzeCode(event.document.getText());
        }
    });

    context.subscriptions.push(activateCommand, deactivateCommand);
}

function isSupportedFileType(document: vscode.TextDocument): boolean {
    const fileType = document.languageId;
    const supportedFileTypes = ['python', 'java', 'cpp', 'csharp'];

    if (supportedFileTypes.includes(fileType)) {
        return true;
    } else {
        vscode.window.showWarningMessage(`File type not supported: ${fileType}`);
        return false;
    }
}

function analyzeCode(code: string) {
    vscode.window.showInformationMessage('Analyzing code...');
}

export function deactivate() {
    // Optional cleanup logic
}
