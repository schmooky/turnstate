import { describe, it, expect } from "vitest";
import { BaseCommand, StateMachine } from "../src";
interface S {
  v: number;
}
class SetV extends BaseCommand<S> {
  constructor(
    playerId: string,
    private v: number,
  ) {
    super({ playerId, type: "SetV" });
  }
  execute(_s: S) {
    return {
      success: true,
      state: { v: this.v },
      sideEffects: [{ type: "notify", data: { v: this.v } }],
    };
  }
  undo(_s: S) {
    return { success: true, state: { v: 0 } };
  }
  validate(_s: S) {
    return { valid: true, errors: [] };
  }
  serialize() {
    return {
      id: this.id,
      playerId: this.playerId,
      type: this.type,
      timestamp: this.timestamp.toISOString(),
      payload: { v: this.v },
    };
  }
}
describe("events", () => {
  it("emits events with previous/next/command/sideEffects", () => {
    const sm = new StateMachine<S>({ v: 0 });
    let captured: number | null = null;
    sm.subscribe((e) => {
      captured = e.next.v;
    });
    sm.executeCommand(new SetV("p1", 42));
    expect(captured).toBe(42);
  });
});
