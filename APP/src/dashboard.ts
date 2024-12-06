import * as vscode from "vscode";

export class CustomTreeProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | null | void> =
        new vscode.EventEmitter<TreeNode | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | null | void> =
        this._onDidChangeTreeData.event;

    // Dummy data for the Tree View
    private data: TreeNode[] = [
        new TreeNode("Root Node 1", [
            new TreeNode("Child Node 1"),
            new TreeNode("Child Node 2", [
                new TreeNode("Grandchild Node 1"),
                new TreeNode("Grandchild Node 2"),
            ]),
        ]),
        new TreeNode("Root Node 2", [
            new TreeNode("Child Node 3"),
            new TreeNode("Child Node 4"),
        ]),
    ];

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeNode): TreeNode[] | Thenable<TreeNode[]> {
        if (element) {
            return element.children;
        } else {
            return this.data;
        }
    }
}

export class TreeNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly children: TreeNode[] = []
    ) {
        super(
            label,
            children.length === 0
                ? vscode.TreeItemCollapsibleState.None
                : vscode.TreeItemCollapsibleState.Collapsed
        );
    }
}