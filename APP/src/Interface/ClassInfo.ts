import Parser from "tree-sitter";

export interface ClassInfo {
  name: string;
  startPosition: Parser.Point; // Comes from Tree-sitter
  endPosition: Parser.Point;
  parent?: string; // Optional property for the parent class name (direct inheritance)
}
