import { MetricCalculator } from "../Core/MetricCalculator";

import { JavaAccessToForeignData } from "../Metrics/Java/JavaAFTD ";
import { JavaAverageMethodWeight } from "../Metrics/Java/JavaAMW";
// import { JavaCognitiveComplexityMetric } from "../Metrics/Java/JavaCoC";
import { JavaDataAbstractionCoupling } from "../Metrics/Java/JavaDAC";
import { JavaLOCMetric } from "../Metrics/Java/JavaLOCC";
import { JavaNumberOfAbstractClassesM } from "../Metrics/Java/JavaNAbsm";
// import { NDUCalculation } from "../Metrics/Java/JavaNDU";
import { JavaNumberOfAttributesMetric } from "../Metrics/Java/JavaNOA";
import { JavaNumberOfAccessorMethods } from "../Metrics/Java/JavaNOAM";
import { JavaNumberOfMethodsMetric } from "../Metrics/Java/JavaNOM";
import { JavaNumberOfPublicAttributesM } from "../Metrics/Java/JavaNOPA";
import { JavaNumberOfProtectedMethodsMetric } from "../Metrics/Java/JavaNProtM";
import { JavaWeightedMethodCount } from "../Metrics/Java/JavaWMC";
import { JavaWeightOfAClass } from "../Metrics/Java/JavaWOC";

// import { ExtractComponentsFromCode } from '../Metrics/Java/JavaWOC';
import { JavaNumberOfAddedServices } from "../Metrics/Java/JavaNAS";
import { TCCCalculation } from "../Metrics/Java/JavaTCC";






import { PythonCyclomaticComplexityMetric } from "../Metrics/Python/PythonCC";
import { PythonLOCMetric } from "../Metrics/Python/PythonLOC";
import { PythonNumberofAttributesMetric } from "../Metrics/Python/PythonNOA";
import { PythonNumberOfAccessorMethods } from "../Metrics/Python/PythonNOAM";
import { PythonNumberOfMethodsMetric } from "../Metrics/Python/PythonNOM";
//import { JavaBaseclassOverwritingMethods } from "../Metrics/Java/JavaBOvM";
// import { BURCalculation } from "../Metrics/Java/JavaBUR";
import { NODCalculation } from "../Metrics/Java/JavaNOD";
import { NODDCalculation } from "../Metrics/Java/JavaNODD";

export class MetricsFactory {
  // Public static method to create a metric object based on the language and metric name
  public static CreateMetric(
    metricName: string,
    language: string
  ): MetricCalculator | null {
    switch (language) {
      case "java":
        return MetricsFactory.createJavaMetric(metricName);
      case "python":
        return MetricsFactory.createPythonMetric(metricName);
      default:
        return null;
    }
  }

  // Dynamically create Java metric object
  private static createJavaMetric(metricName: string): MetricCalculator | null {
    switch (metricName) {
      case "LOC":
        return new JavaLOCMetric();
      case "WMC":
        return new JavaWeightedMethodCount();
      case `WOC`:
        return new JavaWeightOfAClass();
      case `AMW`:
        return new JavaAverageMethodWeight();
      case `AFTD`:
        return new JavaAccessToForeignData();
      case `DAC`:
        return new JavaDataAbstractionCoupling();
      case "NOA":
        return new JavaNumberOfAttributesMetric();
      case "NOM":
        return new JavaNumberOfMethodsMetric();
      case "NOAM":
        return new JavaNumberOfAccessorMethods();
      case "NOPA":
        return new JavaNumberOfPublicAttributesM();
      case "NAbsm":
        return new JavaNumberOfAbstractClassesM();
      case "NProtM":
        return new JavaNumberOfProtectedMethodsMetric();
      // case "CognitiveComplexity":
      //   return new JavaCognitiveComplexityMetric();
      case "NDU":
        // return new NDUCalculation();
      case "NAS":
        return new JavaNumberOfAddedServices();
      case "BUR":
        // return new BURCalculation();
      case "NOD":
        return new NODCalculation();
      case "NODD":
        return new NODDCalculation();
      case "TCC":
        return new TCCCalculation();  

//       case "FANOUT":
//         const javaCode = `

// public class Dog extends Animal {
//     // Overriding the makeSound method from Animal class
    
//     static public void makeSound() {
//         System.out.println("Dog barks");
//     }


// }

           

// `;
//         const parser = new ExtractComponentsFromCode(); // Create an instance of CodeParser
//         const tree = parser.parseCode(javaCode); // Parse the Java code into a syntax tree

//         const components = parser.extractComponents(tree); // Extract classes, methods, and fields

//         console.log("Classes:", components.classes);
//         console.log("Methods:", components.methods);
//         console.log("Fields:", components.fields);
      // console.log('WOC:', components.weight);
      // console.log('Fields:', components.weight);

      default:
        return null;
    }
  }

  // Dynamically create Python metric object
  private static createPythonMetric(
    metricName: string
  ): MetricCalculator | null {
    switch (metricName) {
      case "LOC":
        return new PythonLOCMetric();
      case "CC":
        return new PythonCyclomaticComplexityMetric();
      case "NOA":
        return new PythonNumberofAttributesMetric();
      case "NOM":
        return new PythonNumberOfMethodsMetric();
      case "NOAM":
        return new PythonNumberOfAccessorMethods();
      default:
        return null;
    }
  }
}
