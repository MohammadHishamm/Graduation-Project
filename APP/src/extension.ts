import * as vscode from "vscode";

import { CustomTreeProvider } from "./dashboard";

import { MetricsFactory } from "./Factory/MetricsFactory";

import { javaParser } from "./Languages/javaParser";
import { pythonParser } from "./Languages/pythonParser";

import { ProblemsChecker } from "./Validator/ProblemsChecker";
import { isSupportedFileType } from "./Validator/SupportedFileTypes";

import { MetricsNotifier } from "./Core/MetricsNotifier";

import { MetricsSaver } from "./Saver/MetricsSaver";

import { FolderExtractComponentsFromCode } from "./Extractors/FolderExtractComponentsFromCode";
import { Metric } from "./Core/Metric";

let isActive = true;

let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;

const FECFcode = new FolderExtractComponentsFromCode();

const metricsNotifier = new MetricsNotifier();
const metricsSaver = new MetricsSaver(metricsNotifier); // Pass notifier to MetricsSaver

// CustomTreeProvider listens to the notifier automatically
const customTreeProvider = new CustomTreeProvider();
metricsNotifier.addObserver(customTreeProvider);

export async function activate(context: vscode.ExtensionContext) {
  // Start timer
  console.time("Extension Execution Time");

  console.log("Codepure extension is now active!");

  // Fetch selected metrics initially
  const selectedMetrics = getSelectedMetrics();

  // Create an Output Channel for the extension
  outputChannel = vscode.window.createOutputChannel("CodePure Output");

  vscode.window.showInformationMessage(
    "CodePure is now active! Use 'Ctrl+S' to detect CodeSmells."
  );

  // Create a Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    1000
  );
  statusBarItem.text = "CodePure: Ready";
  statusBarItem.show();

  const activateCommand = vscode.commands.registerCommand(
    "extension.activateCommand",
    async () => {
      if (!isActive) {
        isActive = true;
        vscode.window.showInformationMessage("CodePure is now active!.");
      } else {
        vscode.window.showWarningMessage("CodePure is already active!");
      }
    }
  );

  const deactivateCommand = vscode.commands.registerCommand(
    "extension.deactivateCommand",
    async () => {
      if (isActive) {
        isActive = false;
        vscode.window.showInformationMessage("CodePure Deactivated!");
      } else {
        vscode.window.showWarningMessage("CodePure is not active!");
      }
    }
  );

  // Register the command for analyzing selected code
  const analyzeSelectedCodeCommand = vscode.commands.registerCommand(
    "extension.analyzeSelectedCode",
    async () => {
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

      const problemschecker = new ProblemsChecker(editor.document);
      const issupportedfileType = new isSupportedFileType(editor.document);

      if (!problemschecker.checkForErrors()) {
        if (isActive && issupportedfileType.isSupported()) {
          // Call the analyzeCode function (stub in this example)
          const analysisResult = await AnalyzeSelctedCode(
            editor.document,
            selectedText
          );

          vscode.window.showInformationMessage(
            `Current selected metrics: ${selectedMetrics.join(", ")}`
          );

          // Highlight the selected code
          highlightCode(editor, selection);

          // Show a hover message on the highlighted text
          registerHoverProvider(
            context,
            editor.document.uri,
            selection,
            analysisResult
          );
        }
      }
    }
  );

  vscode.window.registerTreeDataProvider(
    "codepureTreeView",
    customTreeProvider
  );

  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const problemsChecker = new ProblemsChecker(document);
    const isSupportedfiletype = new isSupportedFileType(document);

    if (
      !problemsChecker.checkForErrors() &&
      isSupportedfiletype.isSupported()
    ) {
      const sourceCode = document.getText();
      analyzeCode(document, sourceCode);
    }
  });

  // Register the command to open CodePure settings
  const openSettingsCommand = vscode.commands.registerCommand(
    "codepure.openSettings",
    () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "CodePure"
      );
    }
  );

  // Listen for changes in the settings
  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("extension.selectedMetrics")) {
      const updatedMetrics = getSelectedMetrics();
      vscode.window.showInformationMessage(
        `Metrics updated: ${updatedMetrics.join(", ")}`
      );
    }
  });

  context.subscriptions.push(
    activateCommand,
    deactivateCommand,
    outputChannel,
    statusBarItem,
    analyzeSelectedCodeCommand,
    openSettingsCommand
  );

  // End timer
  console.timeEnd("Extension Execution Time");
}

async function AnalyzeSelctedCode(
  document: vscode.TextDocument,
  sourceCode: string
): Promise<string> {
  vscode.window.showInformationMessage("Analyzing Selected code...");

  const analysisResults: string[] = [];
  try {
    let parser;
    if (document.languageId === "java") {
      parser = new javaParser();
    } else {
      parser = new pythonParser();
    }

    parser.selectLanguage();
    const rootNode = parser.parse(sourceCode);

    const metricsToCalculate = getSelectedMetrics();
    // Calculate metrics
    metricsToCalculate.forEach((metricName) => {
      const metricCalculator = MetricsFactory.CreateMetric(
        metricName,
        document.languageId
      );
      if (metricCalculator) {
        const value = metricCalculator.calculate(
          rootNode,
          sourceCode,
          FECFcode
        );
        analysisResults.push(`${metricName}: ${value}`);
      }
    });

    // Combine the results into a string
    return `Analysis Results:\n${analysisResults.join("\n")}`;
  } catch (error) {
    const errorMessage = `Error during analysis:\n${error}`;
    outputChannel.appendLine(errorMessage);
    return errorMessage;
  }
}

// Function to get selected metrics from settings
function getSelectedMetrics(): string[] {
  const config = vscode.workspace.getConfiguration("codepure");
  return config.get<string[]>("selectedMetrics", [
    "LOC",
    "NOA",
    "NOM",
    "NOPA",
    "NOAM",
  ]);
}

function highlightCode(editor: vscode.TextEditor, selection: vscode.Selection) {
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(255, 215, 0, 0.3)",
  });
  editor.setDecorations(decorationType, [selection]);

  setTimeout(() => {
    decorationType.dispose();
  }, 8000);
}

function registerHoverProvider(
  context: vscode.ExtensionContext,
  documentUri: vscode.Uri,
  selection: vscode.Selection,
  message: string
) {
  const hoverProvider = vscode.languages.registerHoverProvider(
    { scheme: "file", pattern: documentUri.fsPath },
    {
      provideHover(document, position) {
        if (selection.contains(position)) {
          return new vscode.Hover(message);
        }
        return undefined;
      },
    }
  );

  context.subscriptions.push(hoverProvider);

  setTimeout(() => {
    hoverProvider.dispose();
  }, 8000);
}

let isAnalyzing = false; // Flag to track if an analysis is currently running

async function analyzeCode(
  document: vscode.TextDocument,
  sourceCode: string
): Promise<string> {
  if (isAnalyzing) {
    vscode.window.showInformationMessage(
      "Analysis is already running. Please wait..."
    );
    return "Analysis in progress";
  }

  isAnalyzing = true; // Set the flag to indicate analysis is running

  return await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Analyzing ${document.languageId} code`,
      cancellable: false,
    },
    async (progress) => {
      const analysisResults: string[] = [];
      const metricsToCalculate = [
        "LOC",
        "AMW",
        "ATFD",
        "FDP",
        "CBO",
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

        const parser =
          document.languageId === "java"
            ? new javaParser()
            : new pythonParser();
        parser.selectLanguage();
        const rootNode = parser.parse(sourceCode);

        progress.report({
          message: "Parsing workspace files...",
          increment: 20,
        });
        await pause(500);
        FECFcode.parseAllJavaFiles();

        progress.report({ message: "Calculating metrics...", increment: 40 });
        for (const [index, metricName] of metricsToCalculate.entries()) {
          const metricCalculator = MetricsFactory.CreateMetric(
            metricName,
            document.languageId
          );
          if (metricCalculator) {
            const value = metricCalculator.calculate(
              rootNode,
              sourceCode,
              FECFcode
            );
            analysisResults.push(`${metricName}: ${value}`);

            progress.report({
              message: `Calculating ${metricName}...`,
              increment: 30 / metricsToCalculate.length,
            });
            await pause(300);
          }
        }

        progress.report({ message: "Saving metrics...", increment: 20 });
        metricsSaver.saveMetrics(
          analysisResults.map((result) => {
            const [name, value] = result.split(": ");
            return new Metric(name.trim(), parseFloat(value));
          }),
          document.fileName
        );

        vscode.window.showInformationMessage(`Analysis completed.`);
        outputChannel.show();
        outputChannel.appendLine(
          `Analysis Results:\n${analysisResults.join("\n")}`
        );

        return `Analysis Results:\n${analysisResults.join("\n")}`;
      } catch (error) {
        const errorMessage = `Error during analysis:\n${error}`;
        outputChannel.appendLine(errorMessage);
        vscode.window.showErrorMessage(errorMessage);
        return errorMessage;
      } finally {
        isAnalyzing = false; // Reset the flag once the analysis is complete
      }
    }
  );
}

// Helper function to create a delay
function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
