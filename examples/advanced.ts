import { StateMachine, BaseCommand, JsonSerializer, DefaultCommandFactory } from "../src";

interface MyState {
  turn: string;
  players: string[];
  resources: Map<string, number>;
}

class SpendResource extends BaseCommand<MyState> {
  amount: number;
  constructor(playerId: string, amount: number) { super({ playerId, type: "SpendResource" }); this.amount = amount; }
  validate(s: MyState) {
    const have = s.resources.get(this.playerId) ?? 0;
    if (this.playerId !== s.turn) return { valid: false, errors: ["Not your turn"] };
    if (have < this.amount) return { valid: false, errors: ["Insufficient resources"] };
    return { valid: true, errors: [] };
  }
  execute(s: MyState) {
    const next = new Map(s.resources);
    next.set(this.playerId, (next.get(this.playerId) ?? 0) - this.amount);
    return { success: true, state: { ...s, resources: next }, sideEffects: [{ type: "broadcast", data: { spent: this.amount, by: this.playerId } }] };
  }
  undo(s: MyState) {
    const next = new Map(s.resources);
    next.set(this.playerId, (next.get(this.playerId) ?? 0) + this.amount);
    return { success: true, state: { ...s, resources: next } };
  }
  serialize() { return { id: this.id, playerId: this.playerId, type: this.type, timestamp: this.timestamp.toISOString(), payload: { amount: this.amount } }; }
}

const factory = new DefaultCommandFactory<MyState>();
factory.register("SpendResource", (data) => {
  const amount = (data.payload as any)?.amount ?? 0;
  const cmd = new SpendResource(data.playerId, amount);
  // hydrate identity/timestamp if needed (optional)
  return cmd;
});

const state: MyState = { turn: "p1", players: ["p1", "p2"], resources: new Map([["p1", 5], ["p2", 3]]) };

const game = new StateMachine<MyState>(state, {
  validators: [{
    name: "TurnValidator",
    validate(cmd, s) { return cmd.type === "SpendResource" && (cmd as any).playerId !== s.turn ? { valid: false, errors: ["Not your turn"] } : { valid: true, errors: [] }; }
  }],
  serializer: new JsonSerializer<MyState>(),
  stateCloner: (s) => s,
  maxHistorySize: 5000,
  commandFactory: factory
});

game.subscribe((e) => console.log("EVENT:", e));
game.executeCommand(new SpendResource("p1", 3));

const snapshot = game.getStateSnapshot();
console.log("Snapshot:", snapshot);

// Demonstrate rehydration
const rehydrated = new StateMachine<MyState>({ turn: "p1", players: [], resources: new Map() }, { serializer: new JsonSerializer<MyState>(), commandFactory: factory });
rehydrated.loadSnapshot(snapshot);
console.log("Rehydrated state:", rehydrated.getState());
rehydrated.undo();
rehydrated.redo();
