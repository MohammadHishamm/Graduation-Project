import Parser from "tree-sitter";

export interface ClassInfo {
  name: string;
  extendedclass: String;
  isAbstract: Boolean;
  isInterface: Boolean;
  startPosition: Parser.Point; // Comes from Tree-sitter
  endPosition: Parser.Point;
  parent?: string; // Optional property for the parent class name (direct inheritance)
}
