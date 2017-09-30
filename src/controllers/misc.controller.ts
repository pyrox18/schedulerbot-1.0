import { Message, CommandOptions } from 'eris';
import * as moment from 'moment-timezone';

import { SchedulerBot } from '../classes/schedulerbot.class';
import { CommandController } from './command.controller';
import { config } from '../config/bot.config';
import { ParsedMS } from '../interfaces/parsed-ms.interface';

export class MiscController extends CommandController {
  protected bot: SchedulerBot;
  protected commandOptions: CommandOptions;

  constructor() {
    super();
    this.bot = SchedulerBot.getInstance();
    this.commandOptions = {
      guildOnly: true
    }
  }

  public ping(msg: Message, args: string[]): string {
    let now: moment.Moment = moment();
    let diff: number = now.diff(moment(msg.timestamp));
    return `Pong! Time: ${diff}ms`
  }

  public info = (msg: Message, args: string[]): string => {
    let uptimeParsed = this.convertMS(this.bot.uptime);
    let output = "```\n";
    output += "SchedulerBot\n\n";
    output += "Version: " + config.version + "\n";
    output += `Guilds serving: ${this.bot.guilds.size}\n`;
    output += `Users serving: ${this.bot.users.size}\n`;
    output += `Uptime: ${uptimeParsed.d} day(s), ${uptimeParsed.h} hour(s), ${uptimeParsed.m} minute(s), ${uptimeParsed.s} second(s)\n`;
    output += "```"
    return output;
  }

  public support(msg: Message, args: string[]): string {
    return `Click the following link to join the bot's support server. https://discord.gg/CRxRn5X`;
  }

  public invite(msg: Message, args: string[]): string {
    return `Click the following link to invite the bot to your server. https://discordapp.com/oauth2/authorize?client_id=339019867325726722&scope=bot&permissions=150536`;
  }

  private convertMS(ms: number): ParsedMS { // https://gist.github.com/remino/1563878
    let parsedMS: ParsedMS = {
      s: 0,
      m: 0,
      h: 0,
      d: 0
    }
    parsedMS.s = Math.floor(ms / 1000);
    parsedMS.m = Math.floor(parsedMS.s / 60);
    parsedMS.s = parsedMS.s % 60;
    parsedMS.h = Math.floor(parsedMS.m / 60);
    parsedMS.m = parsedMS.m % 60;
    parsedMS.d = Math.floor(parsedMS.h / 24);
    parsedMS.h = parsedMS.h % 24;
    return parsedMS;
  }

  public registerCommands(): boolean {
    this.bot.registerCommand("ping", this.ping, this.commandOptions);
    this.bot.registerCommand("info", this.info, this.commandOptions);
    this.bot.registerCommand("support", this.support, this.commandOptions);
    this.bot.registerCommand("invite", this.invite, this.commandOptions);
    return true;
  }
}

export default MiscController;