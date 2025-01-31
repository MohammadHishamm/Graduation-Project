import Parser from "tree-sitter";

export interface FieldInfo {
  name: string;               // Name of the field
  type: string;               // Type of the field (e.g., int, String)
  modifiers: string;          // Modifiers like public, private, etc.
  isEncapsulated: boolean;    // Whether the field is encapsulated (has getter/setter methods)
  startPosition: Parser.Point; // Start position in the code (for highlighting or location purposes)
  endPosition: Parser.Point;   // End position in the code (for highlighting or location purposes)
}
