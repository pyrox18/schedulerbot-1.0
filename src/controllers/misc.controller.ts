import { Message, CommandOptions, GuildChannel, EmbedOptions } from 'eris';
import * as moment from 'moment-timezone';

import { CommandController } from './command.controller';
import { CalendarModel as Calendar, CalendarDocument } from '../models/calendar.model';
import { CommandError } from '../classes/command-error.class';
import { ParsedMS } from '../interfaces/parsed-ms.interface';
import { BotConfig } from '../interfaces/bot-config.interface';
import { SchedulerBot } from '../classes/schedulerbot.class';
import { Period } from '../classes/period.class';
import { config } from '../config/bot.config';
const version: string = require('../../package.json').version;
const STRINGS: any = require('../resources/strings.resource.json');

export class MiscController extends CommandController {
  constructor(bot: SchedulerBot) {
    super(bot);
  }

  public ping = async (msg: Message, args: string[]): Promise<string> => {
    let now: moment.Moment = moment();
    let diff: number = now.diff(moment(msg.timestamp));
    try {
      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar.checkPerm('ping', msg)) return STRINGS.commandResponses.permissionDenied;
      return `Pong! Time: ${diff}ms`
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public prefix = async (msg: Message, args: string[]): Promise<string> => {
    if (args.length > 1) return `Usage: ${STRINGS.commandUsage.prefix}`;
    try {
      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (args.length < 1) {
        if (!calendar.checkPerm('prefix.show', msg)) return STRINGS.commandResponses.permissionDenied;
        return calendar.prefix;
      }
      else {
        if (!calendar.checkPerm('prefix.modify', msg)) return STRINGS.commandResponses.permissionDenied;
        await calendar.updatePrefix(args[0]);
        let prefixes: string[] = [args[0], "@mention "];
        this.bot.registerGuildPrefix((<GuildChannel>msg.channel).guild.id, prefixes);
        return `Prefix set to \`${prefixes[0]}\`.`;
      }
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public info = (msg: Message, args: string[]): void => {
    let uptimeParsed: Period = new Period(this.bot.uptime);
    let embed: EmbedOptions = {
      description: "A Discord bot for scheduling events.",
      color: 13893595,
      footer: {
        text: "Powered by the Eris library (https://abal.moe/Eris)"
      },
      author: {
        name: "SchedulerBot",
        icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
      },
      fields: [
        {
          name: "Version",
          value: version.toString(),
          inline: true
        },
        {
          name: "Guilds",
          value: this.bot.guilds.size.toString(),
          inline: true
        },
        {
          name: "Users",
          value: this.bot.users.size.toString(),
          inline: true
        },
        {
          name: "Uptime",
          value: `${uptimeParsed.days} day(s), ${uptimeParsed.hours} hour(s), ${uptimeParsed.minutes} minute(s), ${uptimeParsed.seconds} second(s)`
        }
      ]
    }

    this.bot.createMessage(msg.channel.id, { embed: embed });
  }

  public support(msg: Message, args: string[]): string {
    return STRINGS.commandResponses.supportServerLink;
  }

  public invite(msg: Message, args: string[]): string {
    return STRINGS.commandResponses.botInviteLink;
  }

  public registerCommands(): boolean {
    this.bot.registerCommand("ping", this.ping);
    this.bot.registerCommand("info", this.info);
    this.bot.registerCommand("prefix", this.prefix);
    this.bot.registerCommand("support", this.support);
    this.bot.registerCommand("invite", this.invite);
    return true;
  }
}

export default MiscController;