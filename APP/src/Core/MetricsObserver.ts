import { MetricsFileFormat } from "../Interface/MetricsFileFormat";

export interface Observer {
  update(metricsData: MetricsFileFormat[]): void; // Receive the entire set of metrics
}
