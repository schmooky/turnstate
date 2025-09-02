import type { Command, StateSerializer, Validator, CommandFactory } from "./api";

export interface TimeProvider { now(): Date; }
export interface RandomProvider { next(): number; }

export interface StateMachineOptions<TState> {
  validators?: Validator<TState>[];
  serializer?: StateSerializer<TState>;
  stateCloner?: (state: TState) => TState;
  maxHistorySize?: number;
  devMode?: boolean;
  timeProvider?: TimeProvider;
  randomProvider?: RandomProvider;
  commandFactory?: CommandFactory<TState>;
}

export interface HistoryEntry<TState> {
  command: Command<TState>;
  prevState: TState;
}
