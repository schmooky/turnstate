import { describe, it, expect } from "vitest";
import { BaseCommand, StateMachine } from "../src";

interface S {
  count: number;
}

class Inc extends BaseCommand<S> {
  constructor(
    playerId: string,
    readonly by = 1,
  ) {
    super({ playerId, type: "Inc" });
  }
  execute(s: S) {
    return { success: true, state: { count: s.count + this.by } };
  }
  undo(s: S) {
    return { success: true, state: { count: s.count - this.by } };
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
      payload: { by: this.by },
    };
  }
}

describe("basic execution", () => {
  it("increments and stores history", () => {
    const sm = new StateMachine<S>({ count: 0 });
    const r = sm.executeCommand(new Inc("p1", 2));
    expect(r.success).toBe(true);
    expect(sm.getState().count).toBe(2);
  });
});
