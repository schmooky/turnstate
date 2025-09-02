// Minimal WebSocket bridge example.
// Run a local server separately: `node examples/ws-server.js` (see below).
// Then run this example: `npm run examples:websocket`

import { StateMachine, BaseCommand } from "../src";

// Node: use 'ws' package for WebSocket shim
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { WebSocket } from "ws";

interface GS {
  value: number;
}
class SetValue extends BaseCommand<GS> {
  constructor(
    playerId: string,
    private v: number,
  ) {
    super({ playerId, type: "SetValue" });
  }
  execute(_s: GS) {
    return {
      success: true,
      state: { value: this.v },
      sideEffects: [{ type: "notify", data: { v: this.v } }],
    };
  }
  undo(_s: GS) {
    return { success: true, state: { value: 0 } };
  }
  validate(_s: GS) {
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

const sm = new StateMachine<GS>({ value: 0 });

const ws = new WebSocket("ws://localhost:8080");
ws.on("open", () => {
  console.log("WS connected");
  sm.subscribe((evt) => {
    ws.send(JSON.stringify({ kind: "stateChange", evt }));
  });
  sm.executeCommand(new SetValue("p1", 42));
  setTimeout(() => sm.executeCommand(new SetValue("p1", 17)), 500);
});

ws.on("message", (data: any) => {
  console.log("WS message:", data.toString());
});
ws.on("close", () => console.log("WS closed"));
