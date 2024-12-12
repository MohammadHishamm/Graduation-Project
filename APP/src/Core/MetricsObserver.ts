import {MetricsData} from '../Interface/MetricsData/MetricsFileFormat';

export interface Observer {
    update(metricsData: MetricsData[]): void;  // Receive the entire set of metrics
}
