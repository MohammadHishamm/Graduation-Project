import Parser from "tree-sitter";
import { ClassInfo } from "./ClassInfo";
import { MethodInfo } from "./MethodInfo";
import { FieldInfo } from "./FieldInfo";

// types.ts
export interface ParsedComponents {
  classes: ClassInfo[];
  methods: MethodInfo[];
  fields: FieldInfo[];
}
