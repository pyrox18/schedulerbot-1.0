import { Message, CommandOptions, GuildChannel, EmbedOptions, Command } from 'eris';
import * as moment from 'moment-timezone';
import * as chrono from 'chrono-node';

import { FlagParser } from '../classes/flag-parser.class';
import { CommandController } from './command.controller';
import { CalendarModel as Calendar, CalendarDocument } from '../models/calendar.model';
import { EventDocument } from '../models/event.model';
import { Event } from '../interfaces/event.interface';
import { CommandError } from '../classes/command-error.class';
import { BotConfig } from '../interfaces/bot-config.interface';
import { CalendarLock } from '../classes/calendar-lock.class';
import { SchedulerBot } from '../classes/schedulerbot.class';
import { EventParser } from '../classes/event-parser.class';
const config: BotConfig = require('../config/bot.config.json');
const STRINGS: any = require('../resources/strings.resource.json');

export class CalendarController extends CommandController {
  constructor(bot: SchedulerBot) {
    super(bot);
  }

  public initializeCalendar = async (msg: Message, args: string[]): Promise<string> => {
    try {
      if (args.length > 1 || args.length < 1) {
        return `Usage: ${STRINGS.commandUsage.init} - see https://goo.gl/NzNMon under the TZ column for a list of valid timezones.`;
      }
      
      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar) {
        let newCal: CalendarDocument = new Calendar({
          _id: (<GuildChannel>msg.channel).guild.id,
          prefix: config.prefix,
          defaultChannel: msg.channel.id
        });
        calendar = await newCal.save();
      }
      
      if (calendar.timezone) {
        return STRINGS.commandResponses.timezoneInitialized;
      }
      else {
        if (!moment.tz.zone(args[0])) return STRINGS.commandResponses.timezoneNotFound;
        let savedCalendar: CalendarDocument = await calendar.setTimezone(args[0]);
        savedCalendar.defaultChannel = msg.channel.id;
        await savedCalendar.save();
        return `Set calendar timezone to ${savedCalendar.timezone}.`;
      }
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public addEvent = async (msg: Message, args: string[]): Promise<string> => {
    try {
      let now: moment.Moment = moment();
      let guildID: string = (<GuildChannel>msg.channel).guild.id;
      if (args.length < 1) return `Usage: ${STRINGS.commandUsage.event.create}`;

      let lock = await this.bot.calendarLock.acquire(guildID);
      let calendar: CalendarDocument = await Calendar.findById(guildID).exec();
      if (!calendar || !calendar.timezone) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.timezoneNotSet);
      else if (!calendar.checkPerm('event.create', msg)) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.permissionDenied);
      else {
        let parsedEvent: Event = EventParser.parse(args, calendar.timezone, now);
        if (!parsedEvent.name && !parsedEvent.startDate) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.eventParseFail);
        else if (parsedEvent.repeat && parsedEvent.repeat != "d" && parsedEvent.repeat != "w" && parsedEvent.repeat != "m") this.bot.createMessage(msg.channel.id, `Usage: ${STRINGS.commandUsage.event.create}`);
        else if (now.diff(parsedEvent.startDate) > 0) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.createEventInPast);
        else {
          let event: EventDocument = await calendar.addEvent(parsedEvent);
          this.bot.eventScheduler.scheduleEvent(calendar, event);
          let embed: EmbedOptions = {
            title: "New Event",
            color: 8171263,
            author: {
              name: "SchedulerBot",
              icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
            },
            fields: [
              {
                name: "Event Name",
                value: parsedEvent.name
              },
              {
                name: "Description",
                value: parsedEvent.description || "*N/A*"
              },
              {
                name: "Start Date",
                value: moment(parsedEvent.startDate).tz(calendar.timezone).toString(),
                inline: true
              },
              {
                name: "End Date",
                value: moment(parsedEvent.endDate).tz(calendar.timezone).toString(),
                inline: true
              },
              {
                name: "Repeat",
                value: parsedEvent.repeat ? (parsedEvent.repeat == "d" ? "Daily" : (parsedEvent.repeat == "w" ? "Weekly" : "Monthly")) : "*N/A*"
              }
            ]
          }
          
          this.bot.createMessage(msg.channel.id, {
            content: "New event created.",
            embed: embed
          });
        }
      }
      await lock.release();
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public listEvents = async (msg: Message, args: string[]): Promise<string> => {
    try {
      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar || !calendar.timezone) return STRINGS.commandResponses.timezoneNotSet;
      if (!calendar.checkPerm('event.list', msg)) return STRINGS.commandResponses.permissionDenied;
      
      let now: moment.Moment = moment();
      let resultString: string = "```css\n";

      if (calendar.events.length < 1) {
        resultString += "No events found!\n";
      }
      else {
        let i: number = 0;
        let activeEventHeaderWritten: boolean = false;
        while (i < calendar.events.length && now.diff(moment(calendar.events[i].startDate)) > 0) {
          if (!activeEventHeaderWritten) {
            resultString += "[Active Events]\n\n";
          }
          resultString += `${i+1} : ${calendar.events[i].name} /* ${moment(calendar.events[i].startDate).tz(calendar.timezone).toString()} to ${moment(calendar.events[i].endDate).tz(calendar.timezone).toString()} */\n`;
          if (calendar.events[i].description) {
            resultString += `    # ${calendar.events[i].description}\n`;
          }
          if (calendar.events[i].repeat) {
            resultString += `    # Repeat: ${calendar.events[i].repeat}\n`;
          }
          i++;
        }
        if (i < calendar.events.length) {
          resultString += "\n[Upcoming Events]\n\n";
        }
        while (i < calendar.events.length) {
          resultString += `${i+1} : ${calendar.events[i].name} /* ${moment(calendar.events[i].startDate).tz(calendar.timezone).toString()} to ${moment(calendar.events[i].endDate).tz(calendar.timezone).toString()} */\n`;
          if (calendar.events[i].description) {
            resultString += `    # ${calendar.events[i].description}\n`;
          }
          if (calendar.events[i].repeat) {
            resultString += `    # Repeat: ${calendar.events[i].repeat}\n`;
          }
          i++;
        }
      }
      resultString += "```";
      return resultString;
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public deleteEvent = async (msg: Message, args: string[]): Promise<string> => {
    try {
      if (args.length < 1 || args.length > 1) return `Usage: ${STRINGS.commandUsage.event.delete}`;

      let index: number = parseInt(args[0]);
      if (isNaN(index)) return `Usage: ${STRINGS.commandUsage.event.delete}`;

      index--;
      let guildID: string = (<GuildChannel>msg.channel).guild.id;

      let lock = await this.bot.calendarLock.acquire(guildID);
      let calendar: CalendarDocument = await Calendar.findById(guildID).exec();
      if (!calendar) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.timezoneNotSet);
      else if (!calendar.checkPerm('event.delete', msg)) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.permissionDenied);
      else if (index < 0 || index >= calendar.events.length) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.eventNotFound);
      else {
        let deletedEvent: EventDocument = await calendar.deleteEvent(index);
        this.bot.eventScheduler.unscheduleEvent(deletedEvent);
        let embed: EmbedOptions = {
          title: "Delete Event",
          color: 16722731,
          author: {
            name: "SchedulerBot",
            icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
          },
          fields: [
            {
              name: "Event Name",
              value: deletedEvent.name
            },
            {
              name: "Description",
              value: deletedEvent.description || "*N/A*"
            },
            {
              name: "Start Date",
              value: moment(deletedEvent.startDate).tz(calendar.timezone).toString(),
              inline: true
            },
            {
              name: "End Date",
              value: moment(deletedEvent.endDate).tz(calendar.timezone).toString(),
              inline: true
            },
            {
              name: "Repeat",
              value: deletedEvent.repeat ? (deletedEvent.repeat == "d" ? "Daily" : (deletedEvent.repeat == "w" ? "Weekly" : "Monthly")) : "*N/A*"
            }
          ]
        }
  
        this.bot.createMessage(msg.channel.id, {
          content: "Event deleted.",
          embed: embed
        });
      }
      await lock.release();
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public updateEvent = async (msg: Message, args: string[]): Promise<string> => {
    try {
      let now: moment.Moment = moment();
      if (args.length < 2) return `Usage: ${STRINGS.commandUsage.event.update}`;

      let index: number = parseInt(args[0]);
      if (isNaN(index)) return `Usage: ${STRINGS.commandUsage.event.update}`;
      index--;
      
      let guildID: string = (<GuildChannel>msg.channel).guild.id;
      let lock = await this.bot.calendarLock.acquire(guildID);
      let badInput: boolean = false;
      let calendar: CalendarDocument = await Calendar.findById(guildID).exec();
      if (!calendar) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.timezoneNotSet);
      else if (!calendar.checkPerm('event.update', msg)) this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.permissionDenied);
      else {
        let parsedEvent: Event = EventParser.parse(args.slice(1), calendar.timezone, now);
        if (!parsedEvent.name && !parsedEvent.description && !parsedEvent.repeat) {
          this.bot.createMessage(msg.channel.id, `Usage: ${STRINGS.commandUsage.event.update}`);
          badInput = true;
        }
        else {
          if (parsedEvent.startDate) {
            if (now.diff(parsedEvent.startDate) > 0) {
              this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.updateEventInPast);
              badInput = true;
            }
            else if (now.diff(moment(calendar.events[index].startDate)) > 0) {
              this.bot.createMessage(msg.channel.id, STRINGS.commandResponses.updateActiveEvent);
              badInput = true;
            }
          }
          if (parsedEvent.repeat) {
            let repeat = parsedEvent.repeat;
            if (repeat != "d" && repeat != "w" && repeat != "m" && repeat != "off") {
              this.bot.createMessage(msg.channel.id, `Usage: ${STRINGS.commandUsage.event.update}`);
              badInput = true;
            }
          }
        }
  
        if (index < 0 || index >= calendar.events.length) return STRINGS.commandResponses.eventNotFound;
        else if (!badInput) {
          let updatedEvent: EventDocument = await calendar.updateEvent(index, parsedEvent);
          this.bot.eventScheduler.rescheduleEvent(calendar, updatedEvent);
          let embed: EmbedOptions = {
            title: "Update Event",
            color: 16775221,
            author: {
              name: "SchedulerBot",
              icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
            },
            fields: [
              {
                name: "Event Name",
                value: updatedEvent.name
              },
              {
                name: "Description",
                value: updatedEvent.description || "*N/A*"
              },
              {
                name: "Start Date",
                value: moment(updatedEvent.startDate).tz(calendar.timezone).toString(),
                inline: true
              },
              {
                name: "End Date",
                value: moment(updatedEvent.endDate).tz(calendar.timezone).toString(),
                inline: true
              },
              {
                name: "Repeat",
                value: updatedEvent.repeat ? (updatedEvent.repeat == "d" ? "Daily" : (updatedEvent.repeat == "w" ? "Weekly" : "Monthly")) : "*N/A*"
              }
            ]
          }
    
          this.bot.createMessage(msg.channel.id, {
            content: "Event updated.",
            embed: embed
          });
        }
      }
      await lock.release();
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public registerCommands(): boolean {
    this.bot.registerCommand("init", this.initializeCalendar);
    let eventAddCommand: Command = this.bot.registerCommand("event", this.addEvent);
    eventAddCommand.registerSubcommand("list", this.listEvents);
    eventAddCommand.registerSubcommand("delete", this.deleteEvent);
    eventAddCommand.registerSubcommand("update", this.updateEvent);
    return true;
  }

  private getOffsetMoment(date: moment.Moment, timezone: string): moment.Moment {
    let another = date.clone();
    another.tz(timezone);
    another.add(date.utcOffset() - another.utcOffset(), 'minutes');
    return another;
  }
}

export default CalendarController;