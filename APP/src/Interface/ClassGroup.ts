import { ClassInfo } from "./ClassInfo";
import { FieldInfo } from "./FieldInfo";
import { MethodInfo } from "./MethodInfo";

export interface ClassGroup {
  fileName: string;
  name: string;
  classes: ClassInfo[];
  methods: MethodInfo[];
  fields: FieldInfo[];
}
