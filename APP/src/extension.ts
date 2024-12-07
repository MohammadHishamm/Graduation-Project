import * as vscode from "vscode";

import { CustomTreeProvider } from "./dashboard";

import { MetricsFactory } from "./Factory/MetricsFactory";

import { javaParser } from "./Languages/javaParser";
import { pythonParser } from "./Languages/pythonParser";

import { ProblemsChecker } from "./Validator/ProblemsChecker";
import { isSupportedFileType } from "./Validator/SupportedFileTypes";

import { Metric, MetricsSaver } from "./Saver/MetricsSaver";

let isActive = true;
let outputChannel: vscode.OutputChannel;
let statusBarItem: vscode.StatusBarItem;
let metricSaver = new MetricsSaver();

export async function activate(context: vscode.ExtensionContext) {

  // Start timer
  console.time("Extension Execution Time");

  console.log('Codepure extension is now active!');

  // Fetch selected metrics initially
  const selectedMetrics = getSelectedMetrics();

  // Create an Output Channel for the extension
  outputChannel = vscode.window.createOutputChannel("CodePure Output");

  vscode.window.showInformationMessage("CodePure is now active! Use 'Ctrl+S' to detect CodeSmells.");

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
        vscode.window.showInformationMessage(
          "CodePure is now active!.");
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

          vscode.window.showInformationMessage(`Current selected metrics: ${selectedMetrics.join(', ')}`);

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

  // Trigger analysis on document save
  const treeDataProvider = new CustomTreeProvider();
  vscode.window.registerTreeDataProvider("codepureTreeView", treeDataProvider);

  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const problemsChecker = new ProblemsChecker(document);
    const isSupportedfiletype = new isSupportedFileType(document);

    if (!problemsChecker.checkForErrors() && isSupportedfiletype.isSupported()) {
      const sourceCode = document.getText();
       analyzeCode(document, sourceCode);
       treeDataProvider.reload();
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

  // Clear the JSON file on VS Code close
  process.on('exit', metricSaver.clearFile); // Normal exit
  process.on('SIGINT', () => {
    metricSaver.clearFile();;
    process.exit();
  }); // Interrupt (Ctrl+C)
  process.on('SIGTERM', () => {
    metricSaver.clearFile();;
    process.exit();
  }); // Termination

  context.subscriptions.push(
    activateCommand,
    deactivateCommand,
    outputChannel,
    statusBarItem,
    analyzeSelectedCodeCommand,
    openSettingsCommand,
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
        const value = metricCalculator.calculate(rootNode, sourceCode);
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
  const config = vscode.workspace.getConfiguration('codepure');
  return config.get<string[]>('selectedMetrics', ["LOC", "NOA", "NOM", "NOPA", "NOAM"]);
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


 function analyzeCode(
  document: vscode.TextDocument,
  sourceCode: string,
): string {
  vscode.window.showInformationMessage(
    `Analyzing ${document.languageId} code...`
  );

  const analysisResults: string[] = [];

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
    // Dynamically select the parser based on the language
    const parser =
      document.languageId === "java" ? new javaParser() : new pythonParser();

    parser.selectLanguage();
    const rootNode = parser.parse(sourceCode);

    // Calculate metrics
    for (const metricName of metricsToCalculate) {
      const metricCalculator = MetricsFactory.CreateMetric(
        metricName,
        document.languageId
      );
      if (metricCalculator) {
        const value = metricCalculator.calculate(rootNode, sourceCode);
        analysisResults.push(`${metricName}: ${value}`);
      }
    }

    // Map results to Metric objects
    const metrics: Metric[] = analysisResults.map((result) => {
      const [name, value] = result.split(": ");
      if (!name || isNaN(parseFloat(value))) {
        throw new Error(`Invalid metric format: ${result}`);
      }
      return new Metric(name.trim(), parseFloat(value));
    });


    console.log("analyze triggered.");

    // Save metrics
    const metricSaver = new MetricsSaver();
    metricSaver.saveMetrics(metrics, document.fileName);


    
    // Display results in the output channel
    outputChannel.show();
    outputChannel.appendLine(`Analysis Results:\n${analysisResults.join("\n")}`);

    return `Analysis Results:\n${analysisResults.join("\n")}`;
  } catch (error) {
    const errorMessage = `Error during analysis:\n${error}`;
    outputChannel.appendLine(errorMessage);
    vscode.window.showErrorMessage(errorMessage);
    return errorMessage;
  }
}

