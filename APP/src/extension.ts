import * as vscode from 'vscode';
import { ASTParser } from './Core/ASTParser';
import { MetricsFactory } from './Factory/MetricsFactory';
import { ProblemsChecker } from './Validator/ProblemsChecker';


let isActive = true;
let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;


export function activate(context: vscode.ExtensionContext) {
    // Create an Output Channel for the extension
    outputChannel = vscode.window.createOutputChannel("CodePure Output");

    // Create a Status Bar Item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
    statusBarItem.text = "CodePure: Ready";
    statusBarItem.show();

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
        const problemschecker = new ProblemsChecker(document);
        if(!problemschecker.checkForErrors())
        {
            if (isActive && isSupportedFileType(document)) {
                const code = document.getText();
                analyzeJavaCode(document, code);
            }
        }
    });

    context.subscriptions.push(activateCommand, deactivateCommand, outputChannel, statusBarItem);
}

function isSupportedFileType(document: vscode.TextDocument): boolean {
    const fileType = document.languageId;
    const supportedFileTypes = ['java'];

    if (supportedFileTypes.includes(fileType)) {
        return true;
    } else {
        vscode.window.showWarningMessage(`Unsupported file type: ${fileType}`);
        return false;
    }
}

async function analyzeJavaCode(document: vscode.TextDocument, sourceCode: string) {
    vscode.window.showInformationMessage('Analyzing Java code...');
    outputChannel.appendLine("Analyzing Java code...");
    outputChannel.appendLine("Code being analyzed:\n" + sourceCode);

    try {

        
        // will be by the user need
        const metricsToCalculate = ['LOC', 'MethodCount', 'CyclomaticComplexity'];

        // Initialize components
        const parser = new ASTParser();
        const rootNode = parser.parse(sourceCode);

        // Calculate metrics
        metricsToCalculate.forEach(metricName => {
            const metricCalculator = MetricsFactory.createMetric(metricName);
            if (metricCalculator) {
                const value = metricCalculator.calculate(rootNode, sourceCode);
                outputChannel.appendLine(`${value}`);
            }
        });
        outputChannel.show();
    } catch (error) {
        outputChannel.appendLine("Error during analysis:");
        outputChannel.appendLine(`${error}`);
    
    }
}



export function deactivate() {
    // Cleanup logic for the extension
    if (outputChannel) {
        outputChannel.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
