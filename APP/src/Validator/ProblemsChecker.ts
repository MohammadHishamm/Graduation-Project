import * as vscode from 'vscode';

export class ProblemsChecker {

    constructor(private document: vscode.TextDocument) {}

 
    public checkForErrors(): boolean {
        
        const diagnostics = vscode.languages.getDiagnostics(this.document.uri);


        const errors = diagnostics.filter(diagnostic => diagnostic.severity === vscode.DiagnosticSeverity.Error);

       
        if (errors.length !== 0) {
            vscode.window.showWarningMessage('Fix the Problems before analyzing!');
            return true; 
        }

        // No errors found
        return false;
    }
}

