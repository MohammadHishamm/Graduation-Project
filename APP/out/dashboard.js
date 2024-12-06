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
exports.CustomTreeProvider = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
class CustomTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    treeItems = [];
    constructor() {
        // Whenever tree data changes, call the update method
        this.loadMetricsData();
    }
    // Read the Metrics.json file and load the data asynchronously
    async loadMetricsData() {
        let filePath = path.join(__dirname, "..", "src", "Results", "Metrics.json");
        // Remove 'out' from the file path, if it exists
        filePath = filePath.replace(/out[\\\/]?/, ""); // Regular expression to match 'out' and remove it
        try {
            const data = await fs.promises.readFile(filePath, "utf8");
            const metricsData = JSON.parse(data);
            // Map the metricsData to TreeItems
            this.treeItems = metricsData.map(item => {
                return new TreeItem(item.fileName, item.metrics);
            });
            // Pass the items to the tree
            this._onDidChangeTreeData.fire();
        }
        catch (err) {
            console.error("Error reading or parsing metrics file:", err);
        }
    }
    // Get the tree items (files with metrics)
    getTreeItem(element) {
        return element;
    }
    // Get the children (metrics for each file)
    getChildren(element) {
        if (!element) {
            // Top level, return the list of files
            return Promise.resolve(this.treeItems || []);
        }
        // If the element is a file, return the metrics for that file
        return Promise.resolve(element.metrics.map(metric => new TreeItem(`${metric.name}: ${metric.value}`, [])));
    }
}
exports.CustomTreeProvider = CustomTreeProvider;
// TreeItem class to represent each item in the tree (both files and metrics)
class TreeItem extends vscode.TreeItem {
    label;
    metrics;
    constructor(label, metrics = []) {
        super(label, metrics.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.metrics = metrics;
        this.tooltip = `${label}`;
        this.description = metrics.length > 0 ? `${metrics.length} metrics` : "";
        this.contextValue = metrics.length > 0 ? "fileWithMetrics" : "file";
    }
}
//# sourceMappingURL=dashboard.js.map