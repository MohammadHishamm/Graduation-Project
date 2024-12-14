import { FieldInfo } from "./FieldInfo";
import { MethodInfo } from "./MethodInfo";

export interface ClassGroup {
  fileName: string;
  name: string;
  methods: MethodInfo[];
  fields: FieldInfo[];
}
