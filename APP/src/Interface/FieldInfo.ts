import Parser from "tree-sitter";

export interface FieldInfo {
  name: string;
  type?: string;
  modifiers: string;
  startPosition: Parser.Point;
  endPosition: Parser.Point;
}
