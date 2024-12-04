import Parser from 'tree-sitter';

// types.ts
export interface FileParsedComponents {
    classes: ClassGroup[]; 
}

export interface ClassGroup {
    fileName: string;        
    name: string;              
    methods: MethodInfo[];       
    fields: FieldInfo[];         
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
    isOverridden: boolean;
    startPosition: Parser.Point;
    endPosition: Parser.Point;
}

export interface FieldInfo {
    name: string;
    type: string;
    modifiers: string;
    startPosition: Parser.Point;
    endPosition: Parser.Point;
}
