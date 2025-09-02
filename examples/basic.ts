import { StateMachine, BaseCommand } from "../src";

interface MyGameState {
  players: string[];
  board: any;
  customData: { [k: string]: unknown };
}

class AddPlayer extends BaseCommand<MyGameState> {
  constructor(
    playerId: string,
    private name: string,
  ) {
    super({ playerId, type: "AddPlayer" });
  }
  validate(s: MyGameState) {
    const exists = s.players.includes(this.name);
    return exists
      ? { valid: false, errors: ["Player already exists"] }
      : { valid: true, errors: [] };
  }
  execute(s: MyGameState) {
    return {
      success: true,
      state: { ...s, players: [...s.players, this.name] },
    };
  }
  undo(s: MyGameState) {
    return {
      success: true,
      state: { ...s, players: s.players.filter((p) => p !== this.name) },
    };
  }
  serialize() {
    return {
      id: this.id,
      playerId: this.playerId,
      type: this.type,
      timestamp: this.timestamp.toISOString(),
      payload: { name: this.name },
    };
  }
}

const initial: MyGameState = { players: [], board: {}, customData: {} };
const game = new StateMachine<MyGameState>(initial);
game.subscribe((e) => console.log("State changed:", e));
const res = game.executeCommand(new AddPlayer("host", "Alice"));
console.log("Result:", res);
console.log("Snapshot:", game.getStateSnapshot());
