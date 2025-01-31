import Parser from "tree-sitter";

export interface MethodInfo {
  name: string;
  modifiers: string;
  params: string[];
  returnType: string;
  isConstructor: boolean;
  isAccessor: boolean;
  isOverridden: boolean;
  fieldsUsed: string[];
  annotations: string[];
  throwsClause: string[];
  methodBody: string[];
  localVariables: string[];
  methodCalls: string[];
  startPosition: Parser.Point;
  endPosition: Parser.Point;
}

