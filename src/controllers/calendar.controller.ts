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
const config: BotConfig = require('../config/bot.config.json');
const STRINGS: any = require('../resources/strings.resource.json');

export class CalendarController extends CommandController {
  constructor() {
    super();
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
        return `Set calendar timezone to ${savedCalendar.timezone}.`;
      }
    } catch (err) {
      return new CommandError(err, msg).toString();
    }
  }

  public addEvent = async (msg: Message, args: string[]): Promise<string> => {
    try {
      let now: moment.Moment = moment();
      if (args.length < 1) return `Usage: ${STRINGS.commandUsage.event.create}`;

      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar || !calendar.timezone) return STRINGS.commandResponses.timezoneNotSet;
      if (!calendar.checkPerm('event.create', msg)) return STRINGS.commandResponses.permissionDenied;

      let parsedArgs: any = FlagParser.parse(args);
      let inputString: string = parsedArgs._body;
      let results: any = chrono.parse(inputString);
      if (!results[0]) return STRINGS.commandResponses.eventParseFail;

      let eventName: string = inputString.replace(results[0].text, "").trim();
      // If no date supplied by user, assign the current date based on the timezone
      if (results[0].start.impliedValues.day &&
          results[0].start.impliedValues.month &&
          results[0].start.impliedValues.year) {
        let nowWithTimezone: moment.Moment = now.tz(calendar.timezone);
        results[0].start.impliedValues.day = nowWithTimezone.date();
        results[0].start.impliedValues.month = nowWithTimezone.month() + 1;
        results[0].start.impliedValues.year = nowWithTimezone.year();
      }
      let startDate: moment.Moment = this.getOffsetMoment(moment(results[0].start.date()), calendar.timezone);
      let endDate: moment.Moment = results[0].end ? this.getOffsetMoment(moment(results[0].end.date()), calendar.timezone) : startDate.clone().add(1, 'h');
      let eventDescription: string = parsedArgs.desc || null;

      if (now.diff(startDate) > 0) return STRINGS.commandResponses.createEventInPast;
      
      await calendar.addEvent(eventName, startDate, endDate, eventDescription);
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
            value: eventName
          },
          {
            name: "Description",
            value: eventDescription || "*N/A*"
          },
          {
            name: "Start Date",
            value: moment(startDate).tz(calendar.timezone).toString(),
            inline: true
          },
          {
            name: "End Date",
            value: moment(endDate).tz(calendar.timezone).toString(),
            inline: true
          }
        ]
      }
      
      this.bot.createMessage(msg.channel.id, {
        content: "New event created.",
        embed: embed
      });
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

      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar) return STRINGS.commandResponses.timezoneNotSet;
      if (!calendar.checkPerm('event.delete', msg)) return STRINGS.commandResponses.permissionDenied;

      index--;
      if (index < 0 || index >= calendar.events.length) return STRINGS.commandResponses.eventNotFound;

      let deletedEvent: Event = calendar.events[index];
      await calendar.deleteEvent(index);
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
          }
        ]
      }

      this.bot.createMessage(msg.channel.id, {
        content: "Event deleted.",
        embed: embed
      });
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

      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar) return STRINGS.commandResponses.timezoneNotSet;
      if (!calendar.checkPerm('event.update', msg)) return STRINGS.commandResponses.permissionDenied;

      index--;
      let parsedArgs: any = FlagParser.parse(args.slice(1));
      if (!parsedArgs._body && !parsedArgs.desc) return STRINGS.commandUsage.event.update;

      let eventName: string;
      let startDate: moment.Moment;
      let endDate: moment.Moment;
      let eventDescription: string;

      if (parsedArgs._body) {
        let inputString: string = parsedArgs._body;
        let results: any = chrono.parse(inputString);
        if (!results[0]) return STRINGS.commandResponses.eventParseFail;
  
        eventName = inputString.replace(results[0].text, "").trim();
        // If no date supplied by user, assign the current date based on the timezone
        if (results[0].start.impliedValues.day && results[0].start.impliedValues.month && results[0].start.impliedValues.year) {
          let nowWithTimezone: moment.Moment = now.tz(calendar.timezone);
          results[0].start.impliedValues.day = nowWithTimezone.date();
          results[0].start.impliedValues.month = nowWithTimezone.month() + 1;
          results[0].start.impliedValues.year = nowWithTimezone.year();
        }
        startDate = this.getOffsetMoment(moment(results[0].start.date()), calendar.timezone);
        endDate = results[0].end ? this.getOffsetMoment(moment(results[0].end.date()), calendar.timezone) : startDate.clone().add(1, 'h');
        if (now.diff(startDate) > 0) return STRINGS.commandResponses.updateEventInPast;
        if (now.diff(moment(calendar.events[index].startDate)) > 0) return STRINGS.commandResponses.updateActiveEvent;
      }
      if (parsedArgs.desc) {
        eventDescription = parsedArgs.desc;
      }

      if (index < 0 || index >= calendar.events.length) return STRINGS.commandResponses.eventNotFound;

      let updatedEvent: EventDocument = await calendar.updateEvent(index, eventName, startDate, endDate, eventDescription);
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
          }
        ]
      }

      this.bot.createMessage(msg.channel.id, {
        content: "Event updated.",
        embed: embed
      });
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