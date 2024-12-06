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
exports.openDashboard = openDashboard;
const vscode = __importStar(require("vscode"));
function openDashboard() {
    const panel = vscode.window.createWebviewPanel("codePureDashboard", // Identifier for the webview panel
    "CodePure Dashboard", // Title of the panel
    vscode.ViewColumn.One, // Display in the first column
    { enableScripts: true } // Enable JavaScript in the webview
    );
    // Set the HTML content for the dashboard
    panel.webview.html = getDashboardHtml();
    // Listen for messages from the webview (e.g., feedback)
    panel.webview.onDidReceiveMessage((message) => {
        if (message.type === "feedback") {
            vscode.window.showInformationMessage(`Feedback received: ${message.feedback}`);
        }
    });
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
//# sourceMappingURL=dashboard.js.map