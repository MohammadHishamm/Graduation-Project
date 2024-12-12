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
