import * as vscode from 'vscode';
import { ASTParser } from './Core/ASTParser';
import { MetricsFactory } from './Factory/MetricsFactory';
import { ProblemsChecker } from './Validator/ProblemsChecker';
import { javaParser } from './Languages/javaParser';
import { pythonParser } from './Languages/pythonParser';
import { language } from 'tree-sitter-java';


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

    // Command to open the dashboard
    const openDashboardCommand = vscode.commands.registerCommand('extension.openDashboard', () => {
        const panel = vscode.window.createWebviewPanel(
            'codePureDashboard', // Identifier for the webview panel
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
        const problemschecker = new ProblemsChecker(document);
        if(!problemschecker.checkForErrors())
        {
            if (isActive && isSupportedFileType(document)) {
                const code = document.getText();
                analyzeCode(document, code);
            }
        }
    });

    context.subscriptions.push(activateCommand, deactivateCommand, outputChannel, statusBarItem, openDashboardCommand);
}

function isSupportedFileType(document: vscode.TextDocument): boolean {
    const fileType = document.languageId;
    const supportedFileTypes = ['java','python'];

    if (supportedFileTypes.includes(fileType) ) {

        return true;
    } else {
        vscode.window.showWarningMessage(`Unsupported file type: ${fileType}`);
        return false;
    }
}

async function analyzeCode(document: vscode.TextDocument, sourceCode: string) {
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
        const metricsToCalculate = ['LOC', 'CC','NOA','NOM', 'NOAM'];
        // Initialize components
        let parser ;
        if(document.languageId=== "java")
            {
                parser = new javaParser();
            }
            else{
                 parser = new pythonParser();
            }
        
        parser.selectLanguage();
        const rootNode = parser.parse(sourceCode);

        // Calculate metrics
        metricsToCalculate.forEach(metricName => {
            const metricCalculator = MetricsFactory.CreateMetric(metricName,document.languageId);
            if (metricCalculator) {
                const value = metricCalculator.calculate(rootNode, sourceCode);
                outputChannel.appendLine(`${metricName}: ${value}`);
            }
        });
        outputChannel.show();
    } catch (error) {
        outputChannel.appendLine("Error during analysis:");
        outputChannel.appendLine(`${error}`);
    
    }
}




// Create HTML content for the dashboard
function getDashboardHtml(): string {
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

export function deactivate() {
    // Cleanup logic for the extension
    if (outputChannel) {
        outputChannel.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}

