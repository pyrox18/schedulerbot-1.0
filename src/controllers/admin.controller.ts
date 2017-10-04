import { Message, CommandOptions } from 'eris';

import { CommandController } from './command.controller';
import { CommandError } from '../classes/command-error.class';
import { BotConfig } from '../interfaces/bot-config.interface';
const config: BotConfig = require('../config/bot.config.json');;

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
      return new CommandError(err).toString();
    }
  }

  public registerCommands(): boolean {
    this.bot.registerCommand("admincheck", this.adminCheck, this.commandOptions);
    this.bot.registerCommand("forceerror", this.forceError, this.commandOptions);
    return true;
  }
}

export default AdminController;