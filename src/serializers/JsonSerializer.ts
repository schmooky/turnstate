import type { StateSerializer } from "../types/api";
const TAG = "__kind";
export class JsonSerializer<T> implements StateSerializer<T> {
  public readonly name = "json+maps+sets+dates";
  serialize(state: T): string {
    return JSON.stringify(state, (_k, v) => {
      if (v instanceof Map) return { [TAG]: "Map", value: Array.from(v.entries()) };
      if (v instanceof Set) return { [TAG]: "Set", value: Array.from(v.values()) };
      if (v instanceof Date) return { [TAG]: "Date", value: v.toISOString() };
      return v;
    });
  }
  deserialize(data: string): T {
    return JSON.parse(data, (_k, v) => {
      if (v && v[TAG] === "Map") return new Map(v.value);
      if (v && v[TAG] === "Set") return new Set(v.value);
      if (v && v[TAG] === "Date") return new Date(v.value);
      return v;
    });
  }
}
