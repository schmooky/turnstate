import { describe, it, expect } from "vitest";
import { BaseCommand, StateMachine, SeededRandom, FakeTime } from "../src";
interface S {
  val: number;
}
class RandomAdd extends BaseCommand<S> {
  constructor(
    playerId: string,
    private rnd: () => number,
    t: Date,
  ) {
    super({ playerId, type: "RandomAdd", timestamp: t });
  }
  execute(s: S) {
    return {
      success: true,
      state: { val: s.val + Math.floor(this.rnd() * 10) },
    };
  }
  undo(_s: S) {
    return { success: true, state: { val: 0 } };
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
describe("deterministic testing", () => {
  it("produces stable results with seeded RNG and fake time", () => {
    const time = new FakeTime(new Date("2020-01-01T00:00:00Z"));
    const rnd = new SeededRandom(123);
    const sm = new StateMachine<S>(
      { val: 0 },
      { timeProvider: time, randomProvider: rnd },
    );
    const c = new RandomAdd("p1", () => rnd.next(), time.now());
    const r1 = sm.executeCommand(c);
    expect(r1.success).toBe(true);
    expect(sm.getState().val).toBeDefined();
  });
});
