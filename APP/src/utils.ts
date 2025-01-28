import * as vscode from "vscode";

export function getSelectedMetrics(): string[] {
  return vscode.workspace.getConfiguration("codepure").get<string[]>("selectedMetrics", ["LOC", "NOM", "NOPA"]);
}

export function pause(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
