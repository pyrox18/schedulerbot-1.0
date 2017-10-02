import { Message, CommandOptions } from 'eris';
import { CommandController } from './command.controller';

import { config } from '../config/bot.config';

export class AdminController extends CommandController {
  protected commandOptions: CommandOptions;

  constructor() {
    super();
    this.commandOptions = {
      guildOnly: true,
      requirements: {
        userIDs: [config.adminId]
      }
    }
  }

  public adminCheck(msg: Message, args: string[]): string {
    return "Yes";
  }

  public forceError = (msg: Message, args: string[]): string | void => {
    try {
      throw new Error("Test error");
    } catch (err) {
      return err.message;
    }
  }

  public registerCommands(): boolean {
    this.bot.registerCommand("admincheck", this.adminCheck, this.commandOptions);
    this.bot.registerCommand("forceerror", this.forceError, this.commandOptions);
    return true;
  }
}

export default AdminController;