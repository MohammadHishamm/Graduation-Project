import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

// Metric class
export class Metric {
    constructor(
        public name: string,
        public value: number,
    ) { }
}

// Interface for the full metrics data
export interface MetricsData {
    fileName: string;
    metrics: Metric[];
}

export class MetricsSaver {
    private filePath: string;

    constructor() {
        this.filePath = path.join(__dirname, "..", "src", "Results", "Metrics.json");

        // Remove 'out' from the file path, if it exists
        this.filePath = this.filePath.replace(/out[\\\/]?/, ""); // Regular expression to match 'out' and remove it

        // Ensure the 'results' folder exists, create it if it doesn't
        const resultsDir = path.dirname(this.filePath);
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
            console.log(`'Results' folder created at: ${resultsDir}`);
        }

        console.log(`Metrics will be saved to: ${this.filePath}`);
    }

 // Save metrics to the JSON file
 saveMetrics(metrics: Metric[], fileName: string): void {
    if (metrics.length === 0) {
        console.log("No metrics to save.");
        return;
    }

    // Read the current contents of the JSON file
    fs.readFile(this.filePath, "utf8", (err, data) => {
        let currentData: MetricsData[] = [];
        if (err && err.code !== 'ENOENT') {
            console.log("Failed to read metrics file.");
            console.error(err);
            return;
        }

        // Parse the existing file if it exists
        if (data) {
            try {
                currentData = JSON.parse(data);
            } catch (parseError) {
                console.log("Failed to parse JSON data.");
                console.error(parseError);
            }
        }

        // Check if the file with the same name already exists
        const existingIndex = currentData.findIndex(item => item.fileName === fileName);
        if (existingIndex !== -1) {
            // Replace the existing entry with the new metrics
            currentData[existingIndex].metrics = metrics;
            console.log(`Replaced metrics for file: ${fileName}`);
        } else {
            // Append the new metrics for this file
            currentData.push({ fileName, metrics });
            console.log(`Added metrics for new file: ${fileName}`);
        }

        // Save the updated data to the file
        this.writeToFile(currentData);
    });
}

// Write the data to the JSON file
private writeToFile(data: MetricsData[]): void {
    fs.writeFile(this.filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.log("Failed to save metrics to file.");
            console.error(err);
        } else {
            console.log("Metrics saved to Metrics.json.");
        }
    });
}

// Method to clear the file contents (if needed)
clearFile(): void {
    fs.writeFile(this.filePath, "", (err) => {
        if (err) {
            console.log("Failed to clear the file.");
            console.error(err);
        } else {
            console.log("Metrics file cleared.");
        }
    });
}

// Optionally, you could create a method to get the file path for testing purposes
getFilePath(): string {
    return this.filePath;
}
}
