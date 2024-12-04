import Parser from "tree-sitter";

// types.ts
export interface ParsedComponents {
  classes: ClassInfo[];
  methods: MethodInfo[];
  fields: FieldInfo[];
  weight: number; // The calculated weight
}

export interface ClassInfo {
  name: string;
  startPosition: Parser.Point; // Comes from Tree-sitter
  endPosition: Parser.Point;
}

export interface MethodInfo {
  name: string;
  modifiers: string;
  isConstructor: boolean;
  isAccessor: boolean;
  startPosition: Parser.Point;
  endPosition: Parser.Point;
}

export interface FieldInfo {
  name: string;
  modifiers: string;
  startPosition: Parser.Point;
  endPosition: Parser.Point;
}
