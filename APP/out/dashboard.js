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
exports.TreeNode = exports.CustomTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
class CustomTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    // Dummy data for the Tree View
    data = [
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
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return element.children;
        }
        else {
            return this.data;
        }
    }
}
exports.CustomTreeProvider = CustomTreeProvider;
class TreeNode extends vscode.TreeItem {
    label;
    children;
    constructor(label, children = []) {
        super(label, children.length === 0
            ? vscode.TreeItemCollapsibleState.None
            : vscode.TreeItemCollapsibleState.Collapsed);
        this.label = label;
        this.children = children;
    }
}
exports.TreeNode = TreeNode;
//# sourceMappingURL=dashboard.js.map