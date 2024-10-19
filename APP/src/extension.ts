import * as vscode from 'vscode';

let isActive = true; 
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {

    // Create an Output Channel for the extension
    outputChannel = vscode.window.createOutputChannel("CodePure Output");

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
    const supportedFileTypes = ['python', 'java'];

    if (supportedFileTypes.includes(fileType)) {
        return true;
    } else {
        vscode.window.showWarningMessage(`File type not supported: ${fileType}`);
        return false;
    }
}

function analyzeCode(code: string) {
    vscode.window.showInformationMessage('Analyzing code...');

    // Show the analyzed code in the Output Panel
    outputChannel.show(true); // Make sure the output panel is visible
    outputChannel.appendLine('Code being analyzed:\n' + code); // Send code to the output channel
}

export function deactivate() {
    // Optional cleanup logic
    if (outputChannel) {
        outputChannel.dispose(); // Dispose of the output channel
    }
}

function analyzePythoncode(){
    // Python AST analysis logic
}

function analyzeJavacode(){
    // JavaParser analysis logic
}
