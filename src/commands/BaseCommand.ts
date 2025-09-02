import type {
  Command,
  CommandResult,
  SerializedCommand,
  ValidationResult,
} from "../types/api";
import { nextId } from "../core/Id";
export abstract class BaseCommand<TState> implements Command<TState> {
  readonly id: string;
  readonly playerId: string;
  readonly timestamp: Date;
  readonly type: string;
  constructor(params: {
    playerId: string;
    type: string;
    timestamp?: Date;
    id?: string;
  }) {
    this.playerId = params.playerId;
    this.type = params.type;
    this.timestamp = params.timestamp ?? new Date();
    this.id = params.id ?? nextId(this.timestamp.getTime());
  }

  /** Optionally freeze the command instance after subclass construction. */
  protected freeze(): void {
    // Consumers may call this to enforce immutability post-construction.
    Object.freeze(this);
  }
  abstract execute(state: TState): CommandResult<TState>;
  abstract undo(state: TState): CommandResult<TState>;
  abstract validate(state: TState): ValidationResult;
  abstract serialize(): SerializedCommand;
}
