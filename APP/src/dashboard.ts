import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { Observer } from "./Core/MetricsObserver";
import { MetricsFileFormat } from "./Interface/MetricsFileFormat";
import { Metric } from "./Core/Metric";

export class CustomTreeProvider
  implements vscode.TreeDataProvider<TreeItem>, Observer
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeItem | undefined | null | void
  > = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    TreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private treeItems: TreeItem[] = [];

  constructor() {
    this.loadMetricsData();

    // Register the "clearHistory" command
    vscode.commands.registerCommand("extension.clearHistory", this.clearHistory, this);
  }

  private loadMetricsData(metricsData: MetricsFileFormat[] = []): void {
    if (metricsData.length === 0) {
      let filePath = path.join(
        __dirname,
        "..",
        "src",
        "Results",
        "MetricsCalculated.json"
      );
      filePath = filePath.replace(/out[\\\/]?/, "");

      try {
        const data = fs.readFileSync(filePath, "utf8");
        if (data.length === 0) {
          console.log("No metrics to retrieve.");
          return;
        }

        metricsData = JSON.parse(data);
      } catch (err) {
        console.error("Error reading or parsing metrics file:", err);
      }
    }

    const allFilesItem = new TreeItem("ALL Files", []);

    const fileItems = metricsData.map((item) => {
      const fileMetrics = item.metrics.map(
        (metric) => new Metric(metric.name, metric.value)
      );
      return new TreeItem(item.folderName, fileMetrics);
    });

    allFilesItem.children = fileItems;

    // Create Clear History icon and tooltip
    const clearHistoryItem = new TreeItem(
      "Clear History",
      [],
      vscode.TreeItemCollapsibleState.None
    );
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

  update(metricsData: MetricsFileFormat[]): void {
    console.log(`Observer notified: Metrics updated with ${metricsData.length} items.`);
    this.loadMetricsData(metricsData);
  }

  getTreeItem(element: TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TreeItem): Thenable<TreeItem[]> {
    if (!element) {
      return Promise.resolve(this.treeItems);
    }
    if (element.label === "ALL Files") {
      return Promise.resolve(element.children || []);
    }
    return Promise.resolve(
      element.metrics.map(
        (metric) => new TreeItem(`${metric.name}: ${metric.value}`, [])
      )
    );
  }

  clearHistory(): void {
    console.log("Clearing metrics history...");

    let filePath = path.join(
      __dirname,
      "..",
      "src",
      "Results",
      "MetricsCalculated.json"
    );
    filePath = filePath.replace(/out[\\\/]?/, "");

    try {
      fs.writeFileSync(filePath, JSON.stringify([]));
      console.log("Metrics history cleared.");

      this.treeItems = [];
      this._onDidChangeTreeData.fire();
    } catch (err) {
      console.error("Error clearing metrics history file:", err);
    }
  }
}

class TreeItem extends vscode.TreeItem {
  children?: TreeItem[];
  constructor(
    public readonly label: string,
    public metrics: Metric[] = [],
    collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed
  ) {
    super(label, collapsibleState);
    this.tooltip = `${label}`;
    this.description = metrics.length > 0 ? `${metrics.length} metrics` : "";
    this.contextValue = metrics.length > 0 ? "fileWithMetrics" : "file";
  }
}
