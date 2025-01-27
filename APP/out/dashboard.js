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
        this.loadMetricsData(); // Initial data load
    }
    // Load metrics data into the tree
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
        // Create a root node for "ALL Files"
        const allFilesItem = new TreeItem("ALL Files", []);
        // Map metricsData to TreeItems, ensuring the metrics array is passed correctly
        const fileItems = metricsData.map((item) => {
            const fileMetrics = item.metrics.map((metric) => new Metric_1.Metric(metric.name, metric.value));
            return new TreeItem(item.folderName, fileMetrics);
        });
        // Add the file items under the "ALL Files" root node
        allFilesItem.children = fileItems;
        // Set the tree items to include the "ALL Files" root node
        this.treeItems = [allFilesItem];
        // Notify listeners that the tree data has changed
        this._onDidChangeTreeData.fire();
    }
    // Update method to handle the entire metrics data
    update(metricsData) {
        console.log(`Observer notified: Metrics updated with ${metricsData.length} items.`);
        this.loadMetricsData(metricsData); // Reload tree data with updated metrics
    }
    // Get the tree items (files with metrics)
    getTreeItem(element) {
        return element;
    }
    // Get the children (metrics for each file or list of files under ALL Files)
    getChildren(element) {
        if (!element) {
            // Top level: return the "ALL Files" node
            return Promise.resolve(this.treeItems);
        }
        // If the element is "ALL Files", return the file nodes
        if (element.label === "ALL Files") {
            return Promise.resolve(element.children || []);
        }
        // If the element is a file, return the metrics for that file
        return Promise.resolve(element.metrics.map((metric) => new TreeItem(`${metric.name}: ${metric.value}`, [])));
    }
}
exports.CustomTreeProvider = CustomTreeProvider;
// TreeItem class to represent each item in the tree (both files and metrics)
class TreeItem extends vscode.TreeItem {
    label;
    metrics;
    children; // To store children nodes for "ALL Files"
    constructor(label, metrics = [], collapsibleState = vscode
        .TreeItemCollapsibleState.Collapsed) {
        super(label, collapsibleState);
        this.label = label;
        this.metrics = metrics;
        this.tooltip = `${label}`;
        this.description = metrics.length > 0 ? `${metrics.length} metrics` : "";
        this.contextValue = metrics.length > 0 ? "fileWithMetrics" : "file";
    }
}
//# sourceMappingURL=dashboard.js.map