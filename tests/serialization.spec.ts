import { describe, it, expect } from "vitest";
import { StateMachine, JsonSerializer } from "../src";
interface S {
  m: Map<string, number>;
  s: Set<number>;
  d: Date;
}
describe("serializer round-trip", () => {
  it("handles Map/Set/Date", () => {
    const s: S = {
      m: new Map([["a", 1]]),
      s: new Set([1, 2, 3]),
      d: new Date("2020-01-01T00:00:00Z"),
    };
    const ser = new JsonSerializer<S>();
    const out = ser.deserialize(ser.serialize(s));
    expect(out.m.get("a")).toBe(1);
    expect(out.s.has(2)).toBe(true);
    expect(out.d.toISOString()).toBe("2020-01-01T00:00:00.000Z");
  });
});
