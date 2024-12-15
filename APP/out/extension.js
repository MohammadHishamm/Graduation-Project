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
const dashboard_1 = require("./dashboard");
const MetricsFactory_1 = require("./Factory/MetricsFactory");
const javaParser_1 = require("./Languages/javaParser");
const pythonParser_1 = require("./Languages/pythonParser");
const ProblemsChecker_1 = require("./Validator/ProblemsChecker");
const SupportedFileTypes_1 = require("./Validator/SupportedFileTypes");
const MetricsNotifier_1 = require("./Core/MetricsNotifier");
const MetricsFileFormat_1 = require("./Interface/MetricsFileFormat");
const MetricsSaver_1 = require("./Saver/MetricsSaver");
const FolderExtractComponentsFromCode_1 = require("./Extractors/FolderExtractComponentsFromCode");
let isActive = true;
let outputChannel;
let statusBarItem;
const FECFcode = new FolderExtractComponentsFromCode_1.FolderExtractComponentsFromCode();
const metricsNotifier = new MetricsNotifier_1.MetricsNotifier();
const metricsSaver = new MetricsSaver_1.MetricsSaver(metricsNotifier); // Pass notifier to MetricsSaver
// CustomTreeProvider listens to the notifier automatically
const customTreeProvider = new dashboard_1.CustomTreeProvider();
metricsNotifier.addObserver(customTreeProvider);
async function activate(context) {
    // Start timer
    console.time("Extension Execution Time");
    console.log('Codepure extension is now active!');
    // Fetch selected metrics initially
    const selectedMetrics = getSelectedMetrics();
    // Create an Output Channel for the extension
    outputChannel = vscode.window.createOutputChannel("CodePure Output");
    vscode.window.showInformationMessage("CodePure is now active! Use 'Ctrl+S' to detect CodeSmells.");
    // Create a Status Bar Item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
    statusBarItem.text = "CodePure: Ready";
    statusBarItem.show();
    const activateCommand = vscode.commands.registerCommand("extension.activateCommand", async () => {
        if (!isActive) {
            isActive = true;
            vscode.window.showInformationMessage("CodePure is now active!.");
        }
        else {
            vscode.window.showWarningMessage("CodePure is already active!");
        }
    });
    const deactivateCommand = vscode.commands.registerCommand("extension.deactivateCommand", async () => {
        if (isActive) {
            isActive = false;
            vscode.window.showInformationMessage("CodePure Deactivated!");
        }
        else {
            vscode.window.showWarningMessage("CodePure is not active!");
        }
    });
    // Register the command for analyzing selected code
    const analyzeSelectedCodeCommand = vscode.commands.registerCommand("extension.analyzeSelectedCode", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("No active editor found!");
            return;
        }
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showInformationMessage("No text selected!");
            return;
        }
        const problemschecker = new ProblemsChecker_1.ProblemsChecker(editor.document);
        const issupportedfileType = new SupportedFileTypes_1.isSupportedFileType(editor.document);
        if (!problemschecker.checkForErrors()) {
            if (isActive && issupportedfileType.isSupported()) {
                // Call the analyzeCode function (stub in this example)
                const analysisResult = await AnalyzeSelctedCode(editor.document, selectedText);
                vscode.window.showInformationMessage(`Current selected metrics: ${selectedMetrics.join(', ')}`);
                // Highlight the selected code
                highlightCode(editor, selection);
                // Show a hover message on the highlighted text
                registerHoverProvider(context, editor.document.uri, selection, analysisResult);
            }
        }
    });
    vscode.window.registerTreeDataProvider("codepureTreeView", customTreeProvider);
    vscode.workspace.onDidSaveTextDocument(async (document) => {
        const problemsChecker = new ProblemsChecker_1.ProblemsChecker(document);
        const isSupportedfiletype = new SupportedFileTypes_1.isSupportedFileType(document);
        if (!problemsChecker.checkForErrors() && isSupportedfiletype.isSupported()) {
            const sourceCode = document.getText();
            analyzeCode(document, sourceCode);
        }
    });
    // Register the command to open CodePure settings
    const openSettingsCommand = vscode.commands.registerCommand('codepure.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'CodePure');
    });
    // Listen for changes in the settings
    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('extension.selectedMetrics')) {
            const updatedMetrics = getSelectedMetrics();
            vscode.window.showInformationMessage(`Metrics updated: ${updatedMetrics.join(', ')}`);
        }
    });
    context.subscriptions.push(activateCommand, deactivateCommand, outputChannel, statusBarItem, analyzeSelectedCodeCommand, openSettingsCommand);
    // End timer
    console.timeEnd("Extension Execution Time");
}
async function AnalyzeSelctedCode(document, sourceCode) {
    vscode.window.showInformationMessage("Analyzing Selected code...");
    const analysisResults = [];
    try {
        let parser;
        if (document.languageId === "java") {
            parser = new javaParser_1.javaParser();
        }
        else {
            parser = new pythonParser_1.pythonParser();
        }
        parser.selectLanguage();
        const rootNode = parser.parse(sourceCode);
        const metricsToCalculate = getSelectedMetrics();
        // Calculate metrics
        metricsToCalculate.forEach((metricName) => {
            const metricCalculator = MetricsFactory_1.MetricsFactory.CreateMetric(metricName, document.languageId);
            if (metricCalculator) {
                const value = metricCalculator.calculate(rootNode, sourceCode, FECFcode);
                analysisResults.push(`${metricName}: ${value}`);
            }
        });
        // Combine the results into a string
        return `Analysis Results:\n${analysisResults.join("\n")}`;
    }
    catch (error) {
        const errorMessage = `Error during analysis:\n${error}`;
        outputChannel.appendLine(errorMessage);
        return errorMessage;
    }
}
// Function to get selected metrics from settings
function getSelectedMetrics() {
    const config = vscode.workspace.getConfiguration('codepure');
    return config.get('selectedMetrics', ["LOC", "NOA", "NOM", "NOPA", "NOAM"]);
}
function highlightCode(editor, selection) {
    const decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: "rgba(255, 215, 0, 0.3)",
    });
    editor.setDecorations(decorationType, [selection]);
    setTimeout(() => {
        decorationType.dispose();
    }, 8000);
}
function registerHoverProvider(context, documentUri, selection, message) {
    const hoverProvider = vscode.languages.registerHoverProvider({ scheme: "file", pattern: documentUri.fsPath }, {
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
let isAnalyzing = false; // Flag to track if an analysis is currently running
async function analyzeCode(document, sourceCode) {
    if (isAnalyzing) {
        vscode.window.showInformationMessage("Analysis is already running. Please wait...");
        return "Analysis in progress";
    }
    isAnalyzing = true; // Set the flag to indicate analysis is running
    return await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Analyzing ${document.languageId} code`,
        cancellable: false,
    }, async (progress) => {
        const analysisResults = [];
        const metricsToCalculate = [
            "LOC",
            "AMW",
            "AFTD",
            "DAC",
            "WMC",
            "WOC",
            "NOA",
            "NOM",
            "NOAM",
            "NOPA",
            "NAbsm",
            "NProtM",
            "FANOUT",
            "NDU",
            "NAS",
            "BUR",
            "NOD",
            "NODD",
            "TCC",
        ];
        try {
            progress.report({ message: "Initializing parser...", increment: 10 });
            await pause(500);
            const parser = document.languageId === "java" ? new javaParser_1.javaParser() : new pythonParser_1.pythonParser();
            parser.selectLanguage();
            const rootNode = parser.parse(sourceCode);
            progress.report({ message: "Parsing workspace files...", increment: 20 });
            await pause(500);
            FECFcode.parseAllJavaFiles();
            progress.report({ message: "Calculating metrics...", increment: 40 });
            for (const [index, metricName] of metricsToCalculate.entries()) {
                const metricCalculator = MetricsFactory_1.MetricsFactory.CreateMetric(metricName, document.languageId);
                if (metricCalculator) {
                    const value = metricCalculator.calculate(rootNode, sourceCode, FECFcode);
                    analysisResults.push(`${metricName}: ${value}`);
                    progress.report({
                        message: `Calculating ${metricName}...`,
                        increment: 30 / metricsToCalculate.length,
                    });
                    await pause(300);
                }
            }
            progress.report({ message: "Saving metrics...", increment: 20 });
            metricsSaver.saveMetrics(analysisResults.map((result) => {
                const [name, value] = result.split(": ");
                return new MetricsFileFormat_1.Metric(name.trim(), parseFloat(value));
            }), document.fileName);
            vscode.window.showInformationMessage(`Analysis completed.`);
            outputChannel.show();
            outputChannel.appendLine(`Analysis Results:\n${analysisResults.join("\n")}`);
            return `Analysis Results:\n${analysisResults.join("\n")}`;
        }
        catch (error) {
            const errorMessage = `Error during analysis:\n${error}`;
            outputChannel.appendLine(errorMessage);
            vscode.window.showErrorMessage(errorMessage);
            return errorMessage;
        }
        finally {
            isAnalyzing = false; // Reset the flag once the analysis is complete
        }
    });
}
// Helper function to create a delay
function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=extension.js.map