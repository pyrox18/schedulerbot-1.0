import { Message, CommandOptions } from 'eris';
import { inspect } from 'util';

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
      return new CommandError(err, msg).toString();
    }
  }

  public eval = (msg: Message, args: string[]): string => {
    if (msg.author.id !== config.adminId) return; // safety
    try {
      const code = args.join(" ");
      let evaled = eval(code);

      if (typeof evaled !== "string") {
        evaled = inspect(evaled);
      }

      let output: string = "```js\n" + this.clean(evaled) + "\n```";
      if (output.length > 1990) {
        output = output.substr(0, 1986);
        output += "\nTruncated\n```"
      }
      return output;
    } catch (err) {
      return `\`ERROR\` \`\`\`xl\n${this.clean(err)}\n\`\`\``
    }
  }

  public registerCommands(): boolean {
    this.bot.registerCommand("admincheck", this.adminCheck, this.commandOptions);
    this.bot.registerCommand("forceerror", this.forceError, this.commandOptions);
    this.bot.registerCommand("eval", this.eval, this.commandOptions);
    return true;
  }

  private clean(evalResult: any): string {
    if (typeof(evalResult) === "string") {
      return evalResult.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    }
    return evalResult;
  }
}

export default AdminController;