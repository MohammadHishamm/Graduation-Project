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
exports.MetricsSaver = exports.Metric = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Metric class
class Metric {
    name;
    value;
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
exports.Metric = Metric;
class MetricsSaver {
    filePath;
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
    saveMetrics(metrics, fileName) {
        if (metrics.length === 0) {
            console.log("No metrics to save.");
            return;
        }
        // Read the current contents of the JSON file
        fs.readFile(this.filePath, "utf8", (err, data) => {
            let currentData = [];
            if (err && err.code !== 'ENOENT') {
                console.log("Failed to read metrics file.");
                console.error(err);
                return;
            }
            // Parse the existing file if it exists
            if (data) {
                try {
                    currentData = JSON.parse(data);
                }
                catch (parseError) {
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
            }
            else {
                // Append the new metrics for this file
                currentData.push({ fileName, metrics });
                console.log(`Added metrics for new file: ${fileName}`);
            }
            // Save the updated data to the file
            this.writeToFile(currentData);
        });
    }
    // Write the data to the JSON file
    writeToFile(data) {
        fs.writeFile(this.filePath, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.log("Failed to save metrics to file.");
                console.error(err);
            }
            else {
                console.log("Metrics saved to Metrics.json.");
            }
        });
    }
    // Method to clear the file contents (if needed)
    clearFile() {
        fs.writeFile(this.filePath, "", (err) => {
            if (err) {
                console.log("Failed to clear the file.");
                console.error(err);
            }
            else {
                console.log("Metrics file cleared.");
            }
        });
    }
    // Optionally, you could create a method to get the file path for testing purposes
    getFilePath() {
        return this.filePath;
    }
}
exports.MetricsSaver = MetricsSaver;
//# sourceMappingURL=MetricsSaver.js.map