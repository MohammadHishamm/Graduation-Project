import * as fs from "fs";
import * as path from "path";

// Metric class
export class Metric {
    constructor(
        public name: string,
        public value: number,
    ) { }
}

// Interface for the full metrics data
export interface MetricsData {
    fullPath: string;
    folderName: string;
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

    // read w write Async 3ashan a5ly kolo y2of ma3ada dol
    saveMetrics(metrics: Metric[], fullPath: string): void {

        let fileName = path.basename(fullPath);

        // Get the parent directory of the file
        const parentDir = path.dirname(fullPath);

        // Get the immediate folder name (i.e., the last directory in the path)
        let folderName = path.basename(parentDir);

        folderName += `/${fileName}`;
        
        if (metrics.length === 0) {
            console.log("No metrics to save.");
            return;
        }


        let currentData: MetricsData[] = [];

        try {
            // Check if file exists and is not empty
            const data = fs.readFileSync(this.filePath, 'utf8').trim();

            // If the file is empty, handle it gracefully
            if (data === '') {
                console.log("Metrics file is empty, initializing new data.");
            } else {
                // Parse the existing file if it has content
                currentData = JSON.parse(data);
            }
        } catch (err) {
            if (err === 'ENOENT') {
                // If the file doesn't exist, it's not an error, we'll create it
                console.log("Metrics file does not exist, creating a new one.");
            } else {
                // If there's any other error (like JSON parsing error), log it
                console.log("Failed to read or parse metrics file.");
                console.error(err);
                return;
            }
        }

        // Check if the file with the same name already exists
        const existingIndex = currentData.findIndex(item => item.fullPath === fullPath);
        if (existingIndex !== -1) {
            // Replace the existing entry with the new metrics
            currentData[existingIndex].metrics = metrics;
        } else {
            // Append the new metrics for this file
            currentData.push({ fullPath, folderName, metrics });
        }

        // Save the updated data to the file synchronously
        this.writeToFile(currentData);
    }

    private writeToFile(data: MetricsData[]): void {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
            console.log("Metrics saved to Metrics.json.");
        } catch (err) {
            console.log("Failed to save metrics to file.");
            console.error(err);
        }
    }

    // Method to clear the file contents (if needed)
    clearFile(): void {

        this.filePath = path.join(__dirname, "..", "src", "Results", "Metrics.json");

        // Remove 'out' from the file path, if it exists
        this.filePath = this.filePath.replace(/out[\\\/]?/, ""); // Regular expression to match 'out' and remove it

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
