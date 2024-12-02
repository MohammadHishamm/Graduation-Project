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
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const MetricsFactory_1 = require("./Factory/MetricsFactory");
const ProblemsChecker_1 = require("./Validator/ProblemsChecker");
const javaParser_1 = require("./Languages/javaParser");
const pythonParser_1 = require("./Languages/pythonParser");
let isActive = true;
let outputChannel;
let statusBarItem;
function activate(context) {
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
        }
        else {
            vscode.window.showWarningMessage('CodePure is already active!');
        }
    });
    const deactivateCommand = vscode.commands.registerCommand('extension.deactivateCommand', () => {
        if (isActive) {
            isActive = false;
            vscode.window.showInformationMessage('CodePure Deactivated!');
        }
        else {
            vscode.window.showWarningMessage('CodePure is not active!');
        }
    });
    // Register the command for analyzing selected code
    const analyzeSelectedCodeCommand = vscode.commands.registerCommand('extension.analyzeSelectedCode', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No active editor found!');
            return;
        }
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showInformationMessage('No text selected!');
            return;
        }
        const problemschecker = new ProblemsChecker_1.ProblemsChecker(editor.document);
        if (!problemschecker.checkForErrors()) {
            if (isActive && isSupportedFileType(editor.document)) {
                // Call the analyzeCode function (stub in this example)
                const analysisResult = await analyzeCode(editor.document, selectedText);
                // Highlight the selected code
                highlightCode(editor, selection);
                // Show a hover message on the highlighted text
                registerHoverProvider(context, editor.document.uri, selection, analysisResult);
            }
        }
    });
    // Command to open the dashboard
    const openDashboardCommand = vscode.commands.registerCommand('extension.openDashboard', () => {
        const panel = vscode.window.createWebviewPanel('codePureDashboard', // Identifier for the webview panel
        'CodePure Dashboard', // Title of the panel
        vscode.ViewColumn.One, // Display in the first column
        { enableScripts: true } // Enable JavaScript in the webview
        );
        // Set the HTML content for the dashboard
        panel.webview.html = getDashboardHtml();
        // Listen for messages from the webview (e.g., feedback)
        panel.webview.onDidReceiveMessage(message => {
            if (message.type === 'feedback') {
                vscode.window.showInformationMessage(`Feedback received: ${message.feedback}`);
            }
        });
    });
    // Trigger analysis on document save
    vscode.workspace.onDidSaveTextDocument(async (document) => {
        const problemschecker = new ProblemsChecker_1.ProblemsChecker(document);
        if (!problemschecker.checkForErrors()) {
            if (isActive && isSupportedFileType(document)) {
                const code = document.getText();
                await analyzeCode(document, code);
            }
        }
    });
    context.subscriptions.push(activateCommand, deactivateCommand, outputChannel, statusBarItem, openDashboardCommand, analyzeSelectedCodeCommand);
}
function highlightCode(editor, selection) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'rgba(255, 215, 0, 0.3)',
    });
    editor.setDecorations(decorationType, [selection]);
    setTimeout(() => {
        decorationType.dispose();
    }, 8000);
}
function isSupportedFileType(document) {
    const fileType = document.languageId;
    const supportedFileTypes = ['java', 'python'];
    if (supportedFileTypes.includes(fileType)) {
        return true;
    }
    else {
        vscode.window.showWarningMessage(`Unsupported file type: ${fileType}`);
        return false;
    }
}
function registerHoverProvider(context, documentUri, selection, message) {
    const hoverProvider = vscode.languages.registerHoverProvider({ scheme: 'file', pattern: documentUri.fsPath }, {
        provideHover(document, position) {
            if (selection.contains(position)) {
                return new vscode.Hover(message);
            }
            return undefined;
        },
    });
    context.subscriptions.push(hoverProvider);
    setTimeout(() => {
        hoverProvider.dispose();
    }, 8000);
}
async function analyzeCode(document, sourceCode) {
    vscode.window.showInformationMessage('Analyzing code...');
    outputChannel.appendLine("Analyzing code...");
    outputChannel.appendLine("Code being analyzed:\n" + sourceCode);
    const analysisResults = [];
    try {
        const metricsToCalculate = ['LOC', `AMW`, 'WMC', `WOC`, 'NOA', 'NOM', 'NOAM', 'NOPA', 'NAbsm', 'NProtM', 'FANOUT'];
        let parser;
        if (document.languageId === 'java') {
            parser = new javaParser_1.javaParser();
        }
        else {
            parser = new pythonParser_1.pythonParser();
        }
        parser.selectLanguage();
        const rootNode = parser.parse(sourceCode);
        // Calculate metrics
        metricsToCalculate.forEach(metricName => {
            const metricCalculator = MetricsFactory_1.MetricsFactory.CreateMetric(metricName, document.languageId);
            if (metricCalculator) {
                const value = metricCalculator.calculate(rootNode, sourceCode);
                analysisResults.push(`${metricName}: ${value}`);
                outputChannel.appendLine(`${metricName}: ${value}`);
            }
        });
        outputChannel.show();
        // Combine the results into a string
        return `Analysis Results:\n${analysisResults.join('\n')}`;
    }
    catch (error) {
        const errorMessage = `Error during analysis:\n${error}`;
        outputChannel.appendLine(errorMessage);
        return errorMessage;
    }
}
// Create HTML content for the dashboard
function getDashboardHtml() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>CodePure Dashboard</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f9f9f9;
                    color: #333;
                }
                header {
                    background-color: #007acc;
                    color: white;
                    padding: 10px 20px;
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                }
                .container {
                    padding: 20px;
                }
                h2 {
                    color: #007acc;
                    margin-bottom: 10px;
                }
                .section {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                }
                table th, table td {
                    text-align: left;
                    padding: 8px;
                    border-bottom: 1px solid #ddd;
                }
                table th {
                    background-color: #f4f4f4;
                    font-weight: bold;
                }
                .chart-container {
                    position: relative;
                    height: 300px;
                }
                .feedback {
                    display: flex;
                    flex-direction: column;
                }
                .feedback textarea {
                    resize: none;
                    padding: 10px;
                    margin-bottom: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
                .feedback button {
                    align-self: flex-end;
                    background-color: #007acc;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 14px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .feedback button:hover {
                    background-color: #005a9e;
                }
            </style>
        </head>
        <body>
            <header>CodePure Dashboard</header>
            <div class="container">
                <div class="section">
                    <h2>Metrics Summary</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Value</th>
                                <th>Threshold</th>
                            </tr>
                        </thead>
                        <tbody id="metricsTable"></tbody>
                    </table>
                </div>
                <div class="section">
                    <h2>Code Smells Distribution</h2>
                    <div class="chart-container">
                        <canvas id="smellsChart"></canvas>
                    </div>
                </div>
                <div class="section">
                    <h2>Feedback</h2>
                    <div class="feedback">
                        <textarea id="feedbackInput" rows="4" placeholder="Provide your feedback"></textarea>
                        <button id="submitFeedback">Submit Feedback</button>
                    </div>
                </div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const feedbackButton = document.getElementById('submitFeedback');
                feedbackButton.addEventListener('click', () => {
                    const feedbackText = document.getElementById('feedbackInput').value;
                    vscode.postMessage({ type: 'feedback', feedback: feedbackText });
                });
            </script>
        </body>
        </html>
    `;
}
//# sourceMappingURL=extension.js.map