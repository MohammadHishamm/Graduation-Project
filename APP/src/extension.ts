import * as vscode from 'vscode';

let isActive = false;

export function activate(context: vscode.ExtensionContext) {

    const activateCommand = vscode.commands.registerCommand('extension.activateCommand', () => {
        if (!isActive) {
            isActive = true;
            vscode.window.showInformationMessage('Code-Gaurd Activated!');
            // Add activation logic here
        } else {
            vscode.window.showWarningMessage('Code-Gaurd is already active!');
        }
    });

    const deactivateCommand = vscode.commands.registerCommand('extension.deactivateCommand', () => {
        if (isActive) {
            isActive = false;
            vscode.window.showInformationMessage('Code-Gaurd Deactivated!');
            // Add deactivation logic here
        } else {
            vscode.window.showWarningMessage('Code-Gaurd is not active!');
        }
    });

    context.subscriptions.push(activateCommand, deactivateCommand);
}

export function deactivate() {
    // Optional cleanup logic
}
