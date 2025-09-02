import { describe, it, expect } from "vitest";
import { BaseCommand, StateMachine } from "../src";
import type { Validator } from "../src";
interface S {
  turn: string;
  player: string;
}
class EndTurn extends BaseCommand<S> {
  constructor(playerId: string) {
    super({ playerId, type: "EndTurn" });
  }
  execute(s: S) {
    return { success: true, state: { ...s, turn: s.player } };
  }
  undo(s: S) {
    return { success: true, state: { ...s, turn: s.turn } };
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
    };
  }
}
const turnValidator: Validator<S> = {
  name: "TurnValidator",
  validate(cmd, s) {
    return cmd.type === "EndTurn" && cmd.playerId !== s.player
      ? { valid: false, errors: ["Not your turn"] }
      : { valid: true, errors: [] };
  },
};
describe("validation", () => {
  it("blocks invalid command and accumulates errors", () => {
    const sm = new StateMachine<S>(
      { turn: "p1", player: "p1" },
      { validators: [turnValidator] },
    );
    const bad = new EndTurn("p2");
    const r = sm.executeCommand(bad);
    expect(r.success).toBe(false);
    expect(r.error).toContain("Not your turn");
  });
});
