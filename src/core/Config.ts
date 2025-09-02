import type { StateMachineOptions } from "../types/internals";
import { JsonSerializer } from "../serializers/JsonSerializer";
import { deepClone } from "../utils/clone";
import { DefaultCommandFactory } from "./CommandFactory";

export const defaultOptions = <TState>(): Required<
  Pick<StateMachineOptions<TState>, "serializer" | "stateCloner" | "maxHistorySize" | "devMode" | "timeProvider" | "randomProvider" | "validators" | "commandFactory">
> => ({
  serializer: new JsonSerializer<TState>(),
  stateCloner: (s) => deepClone(s),
  maxHistorySize: 10000,
  devMode: false,
  timeProvider: { now: () => new Date() },
  randomProvider: { next: () => Math.random() },
  validators: [],
  commandFactory: new DefaultCommandFactory<TState>()
});
