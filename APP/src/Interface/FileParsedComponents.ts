import Parser from "tree-sitter";
import { ClassGroup } from "./ClassGroup";

// types.ts
export interface FileParsedComponents {
  classes: ClassGroup[];
}
