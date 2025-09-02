export interface IStateMachine<TState> {
  executeCommand(command: Command<TState>): CommandResult<TState>;
  undo(): CommandResult<TState>;
  redo(): CommandResult<TState>;
  getState(): TState;
  getStateSnapshot(): StateSnapshot<TState>;
  loadSnapshot(snapshot: StateSnapshot<TState>): void;
  subscribe(listener: StateChangeListener<TState>): () => void;
  clearHistory(): void;
}

export interface Command<TState> {
  readonly id: string;
  readonly playerId: string;
  readonly timestamp: Date;
  readonly type: string;
  execute(state: TState): CommandResult<TState>;
  undo(state: TState): CommandResult<TState>;
  validate(state: TState): ValidationResult;
  serialize(): SerializedCommand;
}

export interface CommandFactory<TState> {
  /** Register a builder for a given command type */
  register(
    type: string,
    builder: (data: SerializedCommand) => Command<TState>,
  ): void;
  /** Create a concrete Command from its serialized form */
  create(data: SerializedCommand): Command<TState>;
}

export interface CommandResult<TState> {
  success: boolean;
  state?: TState;
  error?: string;
  sideEffects?: SideEffect[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface Validator<TState> {
  name: string;
  validate(command: Command<TState>, state: TState): ValidationResult;
}

export interface StateSerializer<TState> {
  serialize(state: TState): string;
  deserialize(data: string): TState;
}

export interface SerializedCommand {
  id: string;
  playerId: string;
  type: string;
  timestamp: string; // ISO
  payload?: unknown;
  meta?: Record<string, unknown>;
}

export interface SideEffect {
  type: string;
  data?: unknown;
  recipients?: string[];
}

export interface StateChangeEvent<TState> {
  previous: TState;
  next: TState;
  command: Command<TState>;
  sideEffects?: SideEffect[];
}

export type StateChangeListener<TState> = (
  event: StateChangeEvent<TState>,
) => void;

export interface StateSnapshot<TState> {
  version: string;
  timestamp: string;
  state: string; // serialized via configured serializer
  history: {
    done: SerializedCommand[]; // executed commands in order
    undone: SerializedCommand[]; // commands currently in redo stack
    limit: number;
  };
  serializer: { name: string };
}
