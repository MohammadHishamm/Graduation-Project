import { MetricsFileFormat } from "../Interface/MetricsFileFormat";
import { Observer } from "./MetricsObserver";

// MetricsNotifier
export class MetricsNotifier {
  private observers: Observer[] = [];

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(event: string, data: MetricsFileFormat[]): void {
    for (let observer of this.observers) {
      observer.update(data); // Pass the full metrics data
    }
  }
}
