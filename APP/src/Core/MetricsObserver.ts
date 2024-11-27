
export interface Observer 
{
    update(metricName: string, value: number): void;
}