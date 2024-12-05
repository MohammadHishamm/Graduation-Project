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
  parent?: string; // Optional property for the parent class name (direct inheritance)
}

export interface MethodInfo {
  name: string;
  modifiers: string;
  isConstructor: boolean;
  isAccessor: boolean;
  isOverridden: boolean;
  startPosition: Parser.Point;
  endPosition: Parser.Point;
}

export interface FieldInfo {
    name: string;
    type?: string;
    modifiers: string;
    startPosition: Parser.Point;
    endPosition: Parser.Point;
}
