export function deepClone<T>(
  input: T,
  visited = new WeakMap<object, any>(),
): T {
  if (input === null || typeof input !== "object") return input;
  if (visited.has(input as any)) return visited.get(input as any);
  if (input instanceof Date) return new Date(input) as any;
  if (input instanceof Map) {
    const m = new Map();
    visited.set(input as any, m);
    for (const [k, v] of input)
      m.set(deepClone(k, visited), deepClone(v, visited));
    return m as any;
  }
  if (input instanceof Set) {
    const s = new Set();
    visited.set(input as any, s);
    for (const v of input) s.add(deepClone(v, visited));
    return s as any;
  }
  if (Array.isArray(input)) {
    const arr = input.map((v) => deepClone(v, visited)) as any;
    visited.set(input as any, arr);
    return arr;
  }
  const out: any = Object.create(Object.getPrototypeOf(input));
  visited.set(input as any, out);
  for (const key of Reflect.ownKeys(input as any)) {
    // @ts-ignore
    out[key] = deepClone((input as any)[key], visited);
  }
  return out;
}
