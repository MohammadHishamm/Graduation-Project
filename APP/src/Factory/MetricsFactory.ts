import { MetricCalculator } from '../Core/MetricCalculator';

import { JavaWeightedMethodCount } from '../Metrics/Java/JavaWMC';
import { JavaCognitiveComplexityMetric } from '../Metrics/Java/JavaCoC';
import { JavaLOCMetric } from '../Metrics/Java/JavaLOC';
import { JavaNumberOfAbstractClassesM } from '../Metrics/Java/JavaNAbsm';
import { JavaNumberOfAttributesMetric } from '../Metrics/Java/JavaNOA';
import { JavaNumberOfAccessorMethods } from '../Metrics/Java/JavaNOAM';
import { JavaNumberOfMethodsMetric } from '../Metrics/Java/JavaNOM';
import { JavaNumberOfPublicAttributesM } from '../Metrics/Java/JavaNOPA';
import { JavaNumberOfProtectedMethodsMetric } from '../Metrics/Java/JavaNProtM';
import { JavaWeightOfAClass } from '../Metrics/Java/JavaWOC';
import { JavaAverageMethodWeight } from '../Metrics/Java/JavaAMW';
// import { ExtractComponentsFromCode } from '../Metrics/Java/JavaWOC';


import { PythonCyclomaticComplexityMetric } from '../Metrics/Python/PythonCC';
import { PythonLOCMetric } from '../Metrics/Python/PythonLOC';
import { PythonNumberofAttributesMetric } from '../Metrics/Python/PythonNOA';
import { PythonNumberOfAccessorMethods } from '../Metrics/Python/PythonNOAM';
import { PythonNumberOfMethodsMetric } from '../Metrics/Python/PythonNOM';



export class MetricsFactory {
    // Public static method to create a metric object based on the language and metric name
    public static CreateMetric(metricName: string, language: string): MetricCalculator | null {
        switch (language) {
            case 'java':
                return MetricsFactory.createJavaMetric(metricName);
            case 'python':
                return MetricsFactory.createPythonMetric(metricName);
            default:
                return null;  
        }
    }

    // Dynamically create Java metric object
    private static createJavaMetric(metricName: string): MetricCalculator | null {
        switch (metricName) {
            case 'LOC':
                return new JavaLOCMetric();
            case 'WMC':
                return new JavaWeightedMethodCount();
            case `WOC`:
                return new JavaWeightOfAClass();
            case `AMW`:
                return new JavaAverageMethodWeight();
            case 'NOA':
                return new JavaNumberOfAttributesMetric();
            case 'NOM':
                return new JavaNumberOfMethodsMetric();
            case 'NOAM':
                return new JavaNumberOfAccessorMethods();
            case 'NOPA':
                return new JavaNumberOfPublicAttributesM();   
            case 'NAbsm':
                return new JavaNumberOfAbstractClassesM();       
            case 'NProtM':
                return new JavaNumberOfProtectedMethodsMetric();    
            case 'CognitiveComplexity':
                return new JavaCognitiveComplexityMetric();
            case 'FANOUT':    
            const javaCode = `



            package test;

            public class NestedClassesAndComplexFormatting {
            
                private int value = 10;
            
                public class InnerClass {
                    public void display() {
                        System.out.println("Inner class value: " + value);
                    }
                }
            
                public static class StaticNestedClass {
                    public static void printStaticMessage() {
                        System.out.println("Static Nested Class");
                    }
                }
            
                public void complexFormatting() {
                    int x = 5; if (x > 0) { for (int i = 0; i < x; i++) { System.out.println("i: " + i); } }
                }
            }
            
            

`;
            // const parser = new ExtractComponentsFromCode(); // Create an instance of CodeParser
            // const tree = parser.parseCode(javaCode); // Parse the Java code into a syntax tree
            
            // const components = parser.extractComponents(tree); // Extract classes, methods, and fields
            
            // console.log('Classes:', components.classes);
            // console.log('Methods:', components.methods);
            // console.log('Fields:', components.fields);
            // console.log('WOC:', components.weight);
            // console.log('Fields:', components.weight);
            default:
                return null;
        }
    }

    // Dynamically create Python metric object
    private static createPythonMetric(metricName: string): MetricCalculator | null {
        switch (metricName) {
            case 'LOC':
                return new PythonLOCMetric();
            case 'CC':
                return new PythonCyclomaticComplexityMetric();
            case 'NOA':
                return new PythonNumberofAttributesMetric();
            case 'NOM':
                return new PythonNumberOfMethodsMetric();
            case 'NOAM':
                return new PythonNumberOfAccessorMethods();
            default:
                return null;
        }
    }
}
