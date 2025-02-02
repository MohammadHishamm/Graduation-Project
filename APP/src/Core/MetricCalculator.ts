import { FolderExtractComponentsFromCode } from '../Extractors/FolderExtractComponentsFromCode'; 

export abstract class MetricCalculator {
  // Abstract method to be implemented in child classes
  abstract calculate(node: any , FECFC: FolderExtractComponentsFromCode , Filename: string): number; // Ensure it accepts 'sourceCode' and returns 'number'
}
