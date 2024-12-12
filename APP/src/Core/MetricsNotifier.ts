import { Observer } from './MetricsObserver'; 
import {MetricsData} from '../Interface/MetricsData/MetricsFileFormat';


// MetricsNotifier
export class MetricsNotifier {
    private observers: Observer[] = [];

    addObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    removeObserver(observer: Observer): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(event: string, data: MetricsData[]): void {
        for (let observer of this.observers) {
            observer.update(data);  // Pass the full metrics data
        }
    }
}
