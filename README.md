# Turnstate

Deterministic, pluggable, server-authoritative state machine for turn-based multiplayer games. Written in TypeScript, zero runtime dependencies, dual ESM/CJS builds, and built-in test utilities.

## ✨ Highlights
- Agnostic state, Command pattern, deterministic transitions
- Pluggable validation and serialization
- **Custom Command Factory** for rehydrating commands from snapshots
- Unlimited undo/redo with configurable history
- Stable snapshots (versioned) and **history rehydration**
- Event system + side effects
- Test helpers: batch, seeded RNG, fake time
- 0 runtime deps, ESM+CJS, strict TS
- Examples: basic, advanced, **websocket bridge**

## Install
```bash
npm i game-state-machine
```

## Custom Command Factory
```ts
import { DefaultCommandFactory } from "game-state-machine";

const factory = new DefaultCommandFactory<MyState>();
factory.register("SpendResource", (data) => new SpendResource(data.playerId, (data.payload as any).amount));
const sm = new StateMachine<MyState>(initial, { commandFactory: factory });
```

## Snapshot & History Rehydration
```ts
const snapshot = sm.getStateSnapshot();
const sm2 = new StateMachine<MyState>(emptyInitial, { commandFactory: factory });
sm2.loadSnapshot(snapshot); // uses command.undo() to reconstruct prevStates for history
```

## Simple WebSocket Bridge (example)
- Start server: `node examples/ws-server.js`
- Run client example: `npm run examples:websocket`

Events are sent as JSON: `{ kind: "stateChange", evt }`.

## Scripts
- `npm run build` — ESM/CJS + types
- `npm test` / `npm run coverage`
- `npm run examples:basic` / `examples:advanced` / `examples:websocket`

## License
MIT
