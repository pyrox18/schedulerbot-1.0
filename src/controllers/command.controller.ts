import { CommandClient, CommandOptions } from 'eris';
import { SchedulerBot } from '../classes/schedulerbot.class';

export abstract class CommandController {
  protected bot: SchedulerBot;
  protected commandOptions: CommandOptions;

  constructor() {
    this.bot = SchedulerBot.getInstance();
  }

  public abstract registerCommands(): boolean;
}

export default CommandController;