import { CommandClient, CommandOptions } from 'eris';

export abstract class CommandController {
  protected abstract bot: CommandClient;
  protected abstract commandOptions: CommandOptions;

  constructor() {
    
  }

  public abstract registerCommands(): boolean;
}

export default CommandController;