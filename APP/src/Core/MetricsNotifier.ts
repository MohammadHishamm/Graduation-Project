import { Observer } from './MetricsObserver'; 


export class MetricsNotifier 
{
    private observers: Observer[] = [];

    public addObserver(observer: Observer): void {
        this.observers.push(observer);
    }

    public removeObserver(observer: Observer): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    public notify(metricName: string, value: number): void {
        this.observers.forEach(observer => observer.update(metricName, value));
    }
}
