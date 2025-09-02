import type { StateChangeListener, StateChangeEvent } from "../types/api";
export class EventHub<TState> {
  private listeners = new Set<StateChangeListener<TState>>();
  subscribe(fn: StateChangeListener<TState>): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(evt: StateChangeEvent<TState>): void {
    for (const l of Array.from(this.listeners)) {
      try {
        l(evt);
      } catch {}
    }
  }
  clear() {
    this.listeners.clear();
  }
}
