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
describe("undo/redo", () => {
  it("supports unlimited undo/redo with clearing redo on new command", () => {
    const sm = new StateMachine<S>({ count: 0 }, { maxHistorySize: 1000 });
    sm.executeCommand(new Inc("p1", 1));
    sm.executeCommand(new Inc("p1", 1));
    expect(sm.getState().count).toBe(2);
    sm.undo();
    sm.undo();
    expect(sm.getState().count).toBe(0);
    sm.redo();
    expect(sm.getState().count).toBe(1);
    sm.executeCommand(new Inc("p1", 5));
    const r = sm.redo();
    expect(r.success).toBe(false);
  });
});
