import Parser from "tree-sitter";

export interface MethodInfo {
  name: string;
  modifiers: string;
  params: string;
  isConstructor: boolean;
  isAccessor: boolean;
  isOverridden: boolean;
  fieldsUsed: string[];
  startPosition: Parser.Point;
  endPosition: Parser.Point;
}
