export function deepFreeze<T>(obj: T, seen = new WeakSet<object>()): T {
  if (obj === null || typeof obj !== "object" || seen.has(obj as any)) return obj;
  seen.add(obj as any);
  Object.freeze(obj);
  for (const key of Reflect.ownKeys(obj as any)) {
    // @ts-ignore
    deepFreeze((obj as any)[key], seen);
  }
  return obj;
}
