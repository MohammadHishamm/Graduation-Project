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
exports.CustomTreeProvider = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const Metric_1 = require("./Core/Metric");
class CustomTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    treeItems = [];
    constructor() {
        this.loadMetricsData();
        // Register the "clearHistory" command
        vscode.commands.registerCommand("extension.clearHistory", this.clearHistory, this);
    }
    loadMetricsData(metricsData = []) {
        if (metricsData.length === 0) {
            let filePath = path.join(__dirname, "..", "src", "Results", "MetricsCalculated.json");
            filePath = filePath.replace(/out[\\\/]?/, "");
            try {
                const data = fs.readFileSync(filePath, "utf8");
                if (data.length === 0) {
                    console.log("No metrics to retrieve.");
                    return;
                }
                metricsData = JSON.parse(data);
            }
            catch (err) {
                console.error("Error reading or parsing metrics file:", err);
            }
        }
        const allFilesItem = new TreeItem("ALL Files", []);
        const fileItems = metricsData.map((item) => {
            const fileMetrics = item.metrics.map((metric) => new Metric_1.Metric(metric.name, metric.value));
            return new TreeItem(item.folderName, fileMetrics);
        });
        allFilesItem.children = fileItems;
        // Create Clear History icon and tooltip
        const clearHistoryItem = new TreeItem("Clear History", [], vscode.TreeItemCollapsibleState.None);
        clearHistoryItem.command = {
            command: "extension.clearHistory",
            title: "Clear History",
            tooltip: "Click to clear the metrics history",
        };
        // Set the icon for the Clear History item
        clearHistoryItem.iconPath = path.join(__dirname.replace(/out[\\\/]?/, ''), 'src', 'Assets', 'clearhistory.png');
        // Add Clear History item as a child of ALL Files
        allFilesItem.children?.push(clearHistoryItem);
        this.treeItems = [allFilesItem];
        this._onDidChangeTreeData.fire();
    }
    update(metricsData) {
        console.log(`Observer notified: Metrics updated with ${metricsData.length} items.`);
        this.loadMetricsData(metricsData);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return Promise.resolve(this.treeItems);
        }
        if (element.label === "ALL Files") {
            return Promise.resolve(element.children || []);
        }
        return Promise.resolve(element.metrics.map((metric) => new TreeItem(`${metric.name}: ${metric.value}`, [])));
    }
    clearHistory() {
        console.log("Clearing metrics history...");
        let filePath = path.join(__dirname, "..", "src", "Results", "MetricsCalculated.json");
        filePath = filePath.replace(/out[\\\/]?/, "");
        try {
            fs.writeFileSync(filePath, JSON.stringify([]));
            console.log("Metrics history cleared.");
            this.treeItems = [];
            this._onDidChangeTreeData.fire();
        }
        catch (err) {
            console.error("Error clearing metrics history file:", err);
        }
    }
}
exports.CustomTreeProvider = CustomTreeProvider;
class TreeItem extends vscode.TreeItem {
    label;
    metrics;
    children;
    constructor(label, metrics = [], collapsibleState = vscode.TreeItemCollapsibleState.Collapsed) {
        super(label, collapsibleState);
        this.label = label;
        this.metrics = metrics;
        this.tooltip = `${label}`;
        this.description = metrics.length > 0 ? `${metrics.length} metrics` : "";
        this.contextValue = metrics.length > 0 ? "fileWithMetrics" : "file";
    }
}
//# sourceMappingURL=dashboard.js.map