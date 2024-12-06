import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Metric, MetricsData } from "./Saver/MetricsSaver"; // Ensure you import your Metric classes

export class CustomTreeProvider implements vscode.TreeDataProvider<TreeItem> {

    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private treeItems: TreeItem[] = [];

    constructor() {
        // Whenever tree data changes, call the update method
        this.loadMetricsData();
    }

    // Read the Metrics.json file and load the data asynchronously
    private async loadMetricsData(): Promise<void> {
        let filePath = path.join(__dirname, "..", "src", "Results", "Metrics.json");

        // Remove 'out' from the file path, if it exists
        filePath = filePath.replace(/out[\\\/]?/, ""); // Regular expression to match 'out' and remove it


        try {
            const data = await fs.promises.readFile(filePath, "utf8");
            const metricsData: MetricsData[] = JSON.parse(data);

            // Map the metricsData to TreeItems
            this.treeItems = metricsData.map(item => {
                return new TreeItem(item.fileName, item.metrics);
            });

            // Pass the items to the tree
            this._onDidChangeTreeData.fire();
        } catch (err) {
            console.error("Error reading or parsing metrics file:", err);
        }
    }

    // Get the tree items (files with metrics)
    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    // Get the children (metrics for each file)
    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (!element) {
            // Top level, return the list of files
            return Promise.resolve(this.treeItems || []);
        }

        // If the element is a file, return the metrics for that file
        return Promise.resolve(element.metrics.map(metric => new TreeItem(`${metric.name}: ${metric.value}`, [])));
    }
}

// TreeItem class to represent each item in the tree (both files and metrics)
class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public metrics: Metric[] = []
    ) {
        super(label, metrics.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
        this.tooltip = `${label}`;
        this.description = metrics.length > 0 ? `${metrics.length} metrics` : "";
        this.contextValue = metrics.length > 0 ? "fileWithMetrics" : "file";
    }
}
