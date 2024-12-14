import Parser from "tree-sitter";

export interface MethodInfo {
  name: string;
  modifiers: string;
  isConstructor: boolean;
  isAccessor: boolean;
  isOverridden: boolean;
  startPosition: Parser.Point;
  endPosition: Parser.Point;
}
