"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsNotifier = void 0;
class MetricsNotifier {
    observers = [];
    addObserver(observer) {
        this.observers.push(observer);
    }
    removeObserver(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
    }
    notify(metricName, value) {
        this.observers.forEach(observer => observer.update(metricName, value));
    }
}
exports.MetricsNotifier = MetricsNotifier;
//# sourceMappingURL=MetricsNotifier.js.map