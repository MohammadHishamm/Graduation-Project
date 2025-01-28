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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyzeSelctedCode = AnalyzeSelctedCode;
exports.analyzeCode = analyzeCode;
const vscode = __importStar(require("vscode"));
const MetricsFactory_1 = require("../Factory/MetricsFactory");
const javaParser_1 = require("../Languages/javaParser");
const pythonParser_1 = require("../Languages/pythonParser");
const FolderExtractComponentsFromCode_1 = require("../Extractors/FolderExtractComponentsFromCode");
const initialize_1 = require("../initialize");
const FECFcode = new FolderExtractComponentsFromCode_1.FolderExtractComponentsFromCode();
let isAnalyzing = false;
async function AnalyzeSelctedCode(document, sourceCode) {
    vscode.window.showInformationMessage("Analyzing Selected code...");
    const parser = document.languageId === "java" ? new javaParser_1.javaParser() : new pythonParser_1.pythonParser();
    parser.selectLanguage();
    const rootNode = parser.parse(sourceCode);
    const metricsToCalculate = vscode.workspace.getConfiguration("codepure").get("selectedMetrics", []);
    return calculateMetrics(rootNode, sourceCode, document.languageId, metricsToCalculate);
}
async function analyzeCode(document, sourceCode) {
    if (isAnalyzing) {
        vscode.window.showInformationMessage("Analysis is already running. Please wait...");
        return "Analysis in progress";
    }
    isAnalyzing = true;
    try {
        const parser = document.languageId === "java" ? new javaParser_1.javaParser() : new pythonParser_1.pythonParser();
        parser.selectLanguage();
        const rootNode = parser.parse(sourceCode);
        const metricsToCalculate = ["LOC", "NOM", "CBO", "WMC", "NOPA"];
        const results = await calculateMetrics(rootNode, sourceCode, document.languageId, metricsToCalculate);
        initialize_1.servermetricsmanager.sendMetricsFile();
        return results;
    }
    finally {
        isAnalyzing = false;
    }
}
async function calculateMetrics(rootNode, sourceCode, languageId, metrics) {
    const results = [];
    for (const metricName of metrics) {
        const metricCalculator = MetricsFactory_1.MetricsFactory.CreateMetric(metricName, languageId);
        if (metricCalculator) {
            const value = metricCalculator.calculate(rootNode, sourceCode, FECFcode);
            results.push(`${metricName}: ${value}`);
        }
    }
    initialize_1.metricsSaver.saveMetrics(results.map((result) => {
        const [name, value] = result.split(": ");
        return { name, value: parseFloat(value) };
    }), "current-file");
    return results.join("\n");
}
//# sourceMappingURL=AnalyzeCode.js.map