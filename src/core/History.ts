import type { HistoryEntry } from "../types/internals";
import type { SerializedCommand, Command } from "../types/api";
export class HistoryManager<TState> {
  private done: HistoryEntry<TState>[] = [];
  private undone: Command<TState>[] = [];
  constructor(private limit: number) {}
  push(entry: HistoryEntry<TState>) {
    this.done.push(entry);
    if (this.done.length > this.limit) this.done.shift();
    this.undone.length = 0;
  }
  canUndo() {
    return this.done.length > 0;
  }
  canRedo() {
    return this.undone.length > 0;
  }
  popUndo(): HistoryEntry<TState> | undefined {
    const e = this.done.pop();
    if (e) this.undone.push(e.command);
    return e;
  }
  popRedoCommand(): Command<TState> | undefined {
    return this.undone.pop();
  }
  serialize(serializeCmd: (c: HistoryEntry<TState>) => SerializedCommand) {
    return {
      done: this.done.map(serializeCmd),
      undone: this.undone.map((c) => c.serialize()),
      limit: this.limit,
    };
  }
  clear() {
    this.done.length = 0;
    this.undone.length = 0;
  }
  setLimit(limit: number) {
    this.limit = limit;
  }
  loadFromSerialized(
    done: Command<TState>[],
    undone: Command<TState>[],
    prevStates: TState[],
  ) {
    this.done = done.map((cmd, i) => ({
      command: cmd,
      prevState: prevStates[i]!,
    }));
    this.undone = undone.slice();
  }
}
