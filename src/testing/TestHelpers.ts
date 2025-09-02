import type { Command, StateSnapshot } from "../types/api";
import type { RandomProvider, TimeProvider } from "../types/internals";

export function runBatch<TState>(machine: { executeCommand: (c: Command<TState>) => { success: boolean } }, ...commands: Command<TState>[]) {
  for (const c of commands) {
    const r = machine.executeCommand(c);
    if (!r.success) return r;
  }
  return { success: true };
}

export function compareSnapshots<A, B>(a: StateSnapshot<A>, b: StateSnapshot<B>): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export class SeededRandom implements RandomProvider {
  private state: number;
  constructor(seed = 123456789) { this.state = seed | 0; }
  next(): number {
    let x = this.state | 0;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    this.state = x | 0;
    return ((x >>> 0) % 1_000_000) / 1_000_000;
  }
}

export class FakeTime implements TimeProvider {
  private _t: number;
  constructor(start = new Date("2020-01-01T00:00:00Z")) { this._t = +start; }
  now(): Date { return new Date(this._t); }
  advance(ms: number) { this._t += ms; }
}
