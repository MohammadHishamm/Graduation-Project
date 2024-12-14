import { Metric } from "../Core/Metric";

// Interface for the full metrics data
export interface MetricsFileFormat {
  fullPath: string;
  folderName: string;
  metrics: Metric[];
}
