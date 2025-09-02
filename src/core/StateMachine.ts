import type {
  IStateMachine,
  Command,
  CommandResult,
  ValidationResult,
  StateChangeListener,
  StateSnapshot,
  SerializedCommand,
} from "../types/api";
import type { StateMachineOptions } from "../types/internals";
import { defaultOptions } from "./Config";
import { deepClone } from "../utils/clone";
import { deepFreeze } from "../utils/deepFreeze";
import { EventHub } from "./Events";
import { HistoryManager } from "./History";
import { version } from "../version";

export class StateMachine<TState> implements IStateMachine<TState> {
  private state: TState;
  private opts = defaultOptions<TState>();
  private validators: StateMachineOptions<TState>["validators"];
  private serializer;
  private history: HistoryManager<TState>;
  private events = new EventHub<TState>();

  constructor(initialState: TState, options?: StateMachineOptions<TState>) {
    this.opts = { ...defaultOptions<TState>(), ...options };
    this.serializer = this.opts.serializer!;
    this.validators = this.opts.validators ?? [];
    this.state = this.opts.stateCloner!(initialState);
    this.history = new HistoryManager<TState>(this.opts.maxHistorySize!);
  }

  getState(): TState {
    return this.state;
  }

  executeCommand(command: Command<TState>): CommandResult<TState> {
    const v = this.validateAll(command, this.state);
    if (!v.valid) return { success: false, error: v.errors.join("; ") };
    const input = this.opts.devMode ? deepFreeze(this.state) : this.state;
    const result = command.execute(input);
    if (!result.success || result.state === undefined)
      return {
        success: false,
        error: result.error ?? "Command failed without state",
      };
    const previous = this.state;
    const next = this.opts.stateCloner!(result.state);
    this.state = next;
    this.history.push({ command, prevState: previous });
    const evt1: any = { previous, next, command };
    if (result.sideEffects) evt1.sideEffects = result.sideEffects;
    this.events.emit(evt1);
    return result.sideEffects
      ? { success: true, state: next, sideEffects: result.sideEffects }
      : { success: true, state: next };
  }

  undo(): CommandResult<TState> {
    const entry = this.history.popUndo();
    if (!entry) return { success: false, error: "Nothing to undo" };
    const prev = this.state;
    const next = this.opts.stateCloner!(entry.prevState);
    this.state = next;
    const undoResult = entry.command.undo(prev);
    const sideEffects = undoResult.success ? undoResult.sideEffects : undefined;
    const evt2: any = { previous: prev, next, command: entry.command };
    if (sideEffects) evt2.sideEffects = sideEffects;
    this.events.emit(evt2);
    return sideEffects
      ? { success: true, state: next, sideEffects }
      : { success: true, state: next };
  }

  redo(): CommandResult<TState> {
    const cmd = this.history.popRedoCommand();
    if (!cmd) return { success: false, error: "Nothing to redo" };
    const prev = this.state;
    const result = cmd.execute(prev);
    if (!result.success || result.state === undefined)
      return {
        success: false,
        error: "Redo failed due to non-deterministic command",
      };
    const next = this.opts.stateCloner!(result.state);
    this.state = next;
    // push redo as executed with captured prev
    this.history.push({ command: cmd, prevState: prev });
    const evt3: any = { previous: prev, next, command: cmd };
    if (result.sideEffects) evt3.sideEffects = result.sideEffects;
    this.events.emit(evt3);
    return result.sideEffects
      ? { success: true, state: next, sideEffects: result.sideEffects }
      : { success: true, state: next };
  }

  subscribe(listener: StateChangeListener<TState>): () => void {
    return this.events.subscribe(listener);
  }

  getStateSnapshot(): StateSnapshot<TState> {
    return {
      version,
      timestamp: new Date().toISOString(),
      state: this.serializer.serialize(this.state),
      history: this.history.serialize(
        (h) => h.command.serialize() as SerializedCommand,
      ),
      serializer: { name: (this.serializer as any).name ?? "custom" },
    };
  }

  loadSnapshot(snapshot: StateSnapshot<TState>): void {
    // restore state from snapshot
    const snapshotState = this.serializer.deserialize(snapshot.state);
    // rehydrate commands via factory
    const factory = this.opts.commandFactory!;
    const doneCmds = snapshot.history.done.map((sc) => factory.create(sc));
    const undoneCmds = snapshot.history.undone.map((sc) => factory.create(sc));

    // Compute prevStates for each done command by walking backwards via .undo()
    const prevStates: TState[] = new Array(doneCmds.length);
    let cursor = this.opts.stateCloner!(snapshotState);
    for (let i = doneCmds.length - 1; i >= 0; i--) {
      const cmd = doneCmds[i]!;
      const res = cmd.undo(cursor);
      if (!res.success || res.state === undefined) {
        throw new Error(
          `Failed to rehydrate history: undo failed for command ${cmd.type}`,
        );
      }
      prevStates[i] = this.opts.stateCloner!(res.state!);
      cursor = res.state as TState;
    }
    // Now set current state to snapshotState and load history stacks
    this.state = snapshotState;
    this.history.clear();
    this.history.loadFromSerialized(doneCmds, undoneCmds, prevStates);
  }

  clearHistory(): void {
    this.history.clear();
  }

  private validateAll(
    command: Command<TState>,
    state: TState,
  ): ValidationResult {
    const errors: string[] = [];
    for (const v of this.validators ?? []) {
      const r = v.validate(command, state);
      if (!r.valid) errors.push(...r.errors);
    }
    const self = command.validate(state);
    if (!self.valid) errors.push(...self.errors);
    return { valid: errors.length === 0, errors };
  }
}
