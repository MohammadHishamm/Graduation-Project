"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsNotifier = void 0;
// MetricsNotifier
class MetricsNotifier {
    observers = [];
    addObserver(observer) {
        this.observers.push(observer);
    }
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }
    notify(event, data) {
        for (let observer of this.observers) {
            observer.update(data); // Pass the full metrics data
        }
    }
}
exports.MetricsNotifier = MetricsNotifier;
//# sourceMappingURL=MetricsNotifier.js.map