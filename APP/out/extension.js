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
exports.deactivate = deactivate;
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
    vscode.workspace.onDidSaveTextDocument((document) => {
        const problemschecker = new ProblemsChecker_1.ProblemsChecker(document);
        if (!problemschecker.checkForErrors()) {
            if (isActive && isSupportedFileType(document)) {
                const code = document.getText();
                analyzeCode(document, code);
            }
        }
    });
    context.subscriptions.push(activateCommand, deactivateCommand, outputChannel, statusBarItem, openDashboardCommand);
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
async function analyzeCode(document, sourceCode) {
    vscode.window.showInformationMessage('Analyzing Java code...');
    outputChannel.appendLine("Analyzing Java code...");
    outputChannel.appendLine("Code being analyzed:\n" + sourceCode);
    try {
        // const metrics = [
        //     { name: 'LOC', value: 200, threshold: 150 },
        //     { name: 'NOM', value: 12, threshold: 10 }
        // ];
        // const smells = [
        //     { name: 'God Class', count: 5 },
        //     { name: 'Feature Envy', count: 3 },
        //     { name: 'Long Method', count: 7 }
        // ];
        // // Send this data to the dashboard (webview) if it's open
        // vscode.commands.executeCommand('extension.openDashboard'); // Opens the dashboard
        // will be by the user need
        const metricsToCalculate = ['LOC', 'MethodCount', 'CyclomaticComplexity', 'CognetiveComplexity', 'NumberOfAttributes'];
        // Initialize components
        let parser;
        if (document.languageId === "java") {
            parser = new javaParser_1.javaParser();
        }
        else {
            parser = new pythonParser_1.pythonParser();
        }
        parser.selectLanguage();
        const rootNode = parser.parse(sourceCode);
        // Calculate metrics
        metricsToCalculate.forEach(metricName => {
            const metricCalculator = MetricsFactory_1.MetricsFactory.createMetric(metricName, document.languageId);
            if (metricCalculator) {
                const value = metricCalculator.calculate(rootNode, sourceCode);
                outputChannel.appendLine(`${metricName}: ${value}`);
            }
        });
        outputChannel.show();
    }
    catch (error) {
        outputChannel.appendLine("Error during analysis:");
        outputChannel.appendLine(`${error}`);
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
                /* General Styles */
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

                /* Table Styles */
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

                /* Chart Container */
                .chart-container {
                    position: relative;
                    height: 300px;
                }

                /* Feedback Section */
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
                <!-- Metrics Section -->
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
                        <tbody id="metricsTable">
                            <!-- Metrics rows will be dynamically added here -->
                        </tbody>
                    </table>
                </div>

                <!-- Code Smells Chart -->
                <div class="section">
                    <h2>Code Smells Distribution</h2>
                    <div class="chart-container">
                        <canvas id="smellsChart"></canvas>
                    </div>
                </div>

                <!-- Feedback Section -->
                <div class="section">
                    <h2>Feedback</h2>
                    <div class="feedback">
                        <textarea id="feedbackInput" rows="4" placeholder="Enter your feedback here..."></textarea>
                        <button onclick="sendFeedback()">Submit Feedback</button>
                    </div>
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
                // Example Data
                const exampleMetrics = [
                    { name: 'Lines of Code (LOC)', value: 200, threshold: 150 },
                    { name: 'Number of Methods (NOM)', value: 12, threshold: 10 }
                ];
                const exampleSmells = [
                    { name: 'God Class', count: 5 },
                    { name: 'Feature Envy', count: 3 },
                    { name: 'Long Method', count: 7 }
                ];

                // Populate Metrics Table
                const metricsTable = document.getElementById('metricsTable');
                exampleMetrics.forEach(metric => {
                    const row = document.createElement('tr');
                    row.innerHTML = \`
                        <td>\${metric.name}</td>
                        <td>\${metric.value}</td>
                        <td>\${metric.threshold}</td>
                    \`;
                    metricsTable.appendChild(row);
                });

                // Render Code Smells Chart
                const ctx = document.getElementById('smellsChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: exampleSmells.map(smell => smell.name),
                        datasets: [{
                            label: 'Detected Smells',
                            data: exampleSmells.map(smell => smell.count),
                            backgroundColor: ['#007acc', '#ff6f61', '#4caf50'],
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                        },
                    },
                });

                // Send Feedback Function
                function sendFeedback() {
                    const feedback = document.getElementById('feedbackInput').value;
                    if (feedback) {
                        alert(\`Feedback submitted: \${feedback}\`);
                        document.getElementById('feedbackInput').value = '';
                    } else {
                        alert('Please enter feedback before submitting.');
                    }
                }
            </script>
        </body>
        </html>
    `;
}
function deactivate() {
    // Cleanup logic for the extension
    if (outputChannel) {
        outputChannel.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
//# sourceMappingURL=extension.js.map