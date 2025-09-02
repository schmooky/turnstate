import type {
  CommandFactory as ICommandFactory,
  SerializedCommand,
  Command,
} from "../types/api";
export class DefaultCommandFactory<TState> implements ICommandFactory<TState> {
  private registry = new Map<
    string,
    (data: SerializedCommand) => Command<TState>
  >();
  register(
    type: string,
    builder: (data: SerializedCommand) => Command<TState>,
  ): void {
    this.registry.set(type, builder);
  }
  create(data: SerializedCommand): Command<TState> {
    const b = this.registry.get(data.type);
    if (!b)
      throw new Error(`No builder registered for command type: ${data.type}`);
    return b(data);
  }
}
