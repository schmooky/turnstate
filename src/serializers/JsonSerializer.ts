import type { StateSerializer } from "../types/api";
const TAG = "__kind";

function encode(value: any, seen = new WeakMap<object, any>()): any {
  if (value === null || typeof value !== "object") return value;
  if (seen.has(value as any)) return seen.get(value as any);

  if (value instanceof Date)
    return { [TAG]: "Date", value: value.toISOString() };
  if (value instanceof Map) {
    const m = {
      [TAG]: "Map",
      value: Array.from(value.entries()).map(([k, v]) => [
        encode(k, seen),
        encode(v, seen),
      ]),
    };
    return m;
  }
  if (value instanceof Set) {
    return {
      [TAG]: "Set",
      value: Array.from(value.values()).map((v) => encode(v, seen)),
    };
  }
  if (Array.isArray(value)) return value.map((v) => encode(v, seen));

  const out: any = {};
  seen.set(value as any, out);
  for (const key of Object.keys(value)) {
    // @ts-ignore
    out[key] = encode(value[key], seen);
  }
  return out;
}

function decode(value: any): any {
  if (value === null || typeof value !== "object") return value;
  if (value[TAG] === "Date") return new Date(value.value);
  if (value[TAG] === "Map")
    return new Map(
      (value.value as any[]).map(([k, v]) => [decode(k), decode(v)]),
    );
  if (value[TAG] === "Set")
    return new Set((value.value as any[]).map((v) => decode(v)));
  if (Array.isArray(value)) return value.map((v) => decode(v));

  const out: any = {};
  for (const key of Object.keys(value)) out[key] = decode(value[key]);
  return out;
}

export class JsonSerializer<T> implements StateSerializer<T> {
  public readonly name = "json+maps+sets+dates";
  serialize(state: T): string {
    return JSON.stringify(encode(state));
  }
  deserialize(data: string): T {
    return decode(JSON.parse(data));
  }
}
