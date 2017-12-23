import { GuildChannel, Message } from "eris";

import { CommandError } from "../classes/command-error.class";
import { SchedulerBot } from "../classes/schedulerbot.class";
import { CalendarDocument, CalendarModel as Calendar } from "../models/calendar.model";
import { CommandController } from "./command.controller";
// tslint:disable-next-line
const STRINGS: any = require("../resources/strings.resource.json");

export class SettingsController extends CommandController {
  constructor(bot: SchedulerBot) {
    super(bot);
  }

  public viewSettings = async (msg: Message, args: string[]): Promise<string> => {
    try {
      const calendar: CalendarDocument = await Calendar.findById((msg.channel as GuildChannel).guild.id).exec();

      this.bot.createMessage(msg.channel.id, {
        embed: {
          title: "Settings",
          color: 13893595,
          description: "Run `settings <setting>` to view more details. e.g. `settings prefix`",
          author: {
            name: "SchedulerBot",
            icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
          },
          fields: [
            {
              name: "prefix",
              value: `Current value: \`${calendar.prefix}\``,
              inline: true
            },
            {
              name: "defaultchannel",
              value: `Current value: <#${calendar.defaultChannel}>`,
              inline: true
            }
          ]
        }
      });
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public prefixSetting = async (msg: Message, args: string[]): Promise<string> => {
    try {
      const calendar: CalendarDocument = await Calendar.findById((msg.channel as GuildChannel).guild.id).exec();

      if (args.length < 1 || args.length > 1) {
        if (!calendar.checkPerm("prefix.show", msg)) { return STRINGS.commandResponses.permissionDenied; }
        this.bot.createMessage(msg.channel.id, {
          embed: {
            title: "Settings: Prefix",
            color: 13893595,
            description: "Run `settings prefix <newPrefix>` to change the prefix. e.g. `settings prefix ++`",
            author: {
              name: "SchedulerBot",
              icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
            },
            fields: [
              {
                name: "Current Value",
                value: `\`${calendar.prefix}\``,
                inline: true
              }
            ]
          }
        });
      }
      else {
        if (!calendar.checkPerm("prefix.modify", msg)) { return STRINGS.commandResponses.permissionDenied; }
        await calendar.updatePrefix(args[0]);
        const prefixes: string[] = [args[0], "@mention "];
        this.bot.registerGuildPrefix((msg.channel as GuildChannel).guild.id, prefixes);
        return `Prefix set to \`${prefixes[0]}\`.`;
      }
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public defaultChannelSetting = async (msg: Message, args: string[]): Promise<string> => {
    try {
      const guildID = (msg.channel as GuildChannel).guild.id;
      const calendar: CalendarDocument = await Calendar.findById(guildID).exec();

      if (args.length !== 1 || msg.channelMentions.length !== 1) {
        // TODO: perms
        // if (!calendar.checkPerm("defaultChannel.show", msg)) { return STRINGS.commandResponses.permissionDenied; }
        this.bot.createMessage(msg.channel.id, {
          embed: {
            title: "Settings: Default Channel",
            color: 13893595,
            description: "Run `settings defaultchannel #newchannel` to change the prefix. e.g. `settings defaultchannel #general`", // tslint:disable-line
            author: {
              name: "SchedulerBot",
              icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
            },
            fields: [
              {
                name: "Current Value",
                value: `<#${calendar.defaultChannel}>`,
                inline: true
              }
            ]
          }
        });
      }
      else {
        // TODO: perms
        await calendar.updateDefaultChannel(msg.channelMentions[0]);
        calendar.events.forEach((event) => {
          this.bot.eventScheduler.rescheduleEvent(calendar, event);
        });
        return `Updated default channel to <#${calendar.defaultChannel}>.`;
      }
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public registerCommands(): boolean {
    const settingsCommand = this.bot.registerCommand("settings", this.viewSettings);
    settingsCommand.registerSubcommand("prefix", this.prefixSetting);
    settingsCommand.registerSubcommand("defaultchannel", this.defaultChannelSetting);
    return true;
  }
}
