import { Message, CommandOptions, GuildChannel, EmbedOptions, Command } from 'eris';
import { DocumentQuery } from 'mongoose';
import * as moment from 'moment-timezone';
import * as winston from 'winston';
import * as chrono from 'chrono-node';

import { CommandController } from './command.controller';
import { config } from '../config/bot.config';
import { CalendarModel as Calendar, CalendarDocument } from '../models/calendar.model';
import { Event } from '../interfaces/event.interface';

export class CalendarController extends CommandController {
  protected commandOptions: CommandOptions;

  constructor() {
    super();
    this.commandOptions = {
      guildOnly: true
    }
  }

  public initializeCalendar = async (msg: Message, args: string[]): Promise<string> => {
    try {
      if (args.length > 1 || args.length < 1) {
        return "Not enough arguments.";
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
        return "Timezone already initialized.";
      }
      else {
        let savedCalendar: CalendarDocument = await calendar.setTimezone(args[0]);
        return `Set calendar timezone to ${savedCalendar.timezone}.`;
      }
    } catch (err) {
      return err;
    }
  }

  public addEvent = async (msg: Message, args: string[]): Promise<string> => {
    try {
      let now: moment.Moment = moment();
      if (args.length < 1) return "Usage: `event <event details>` Example: `event CSGO Scrims 7pm-9pm tomorrow`";

      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar || !calendar.timezone) return "Timezone not set. Run the `init <timezone>` command to set the timezone first.";
      if (!calendar.checkPerm('event.create', msg)) return "You are not permitted to use this command.";

      let inputString: string = args.join(' ');
      let results: any = chrono.parse(inputString);
      if (!results[0]) return "Failed to parse event data.";

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
      let startDate: moment.Moment = moment(results[0].start.date());
      let endDate: moment.Moment = results[0].end ? moment(results[0].end.date()) : startDate.clone().add(1, 'h');

      if (now.diff(startDate) > 0) return "Cannot create an event that starts or ends in the past.";
      
      await calendar.addEvent(eventName, startDate, endDate);
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
      return err;
    }
  }

  public listEvents = async (msg: Message, args: string[]): Promise<string> => {
    try {
      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar || !calendar.timezone) return "Timezone not set. Run the `init <timezone>` command to set the timezone first.";
      if (!calendar.checkPerm('event.list', msg)) return "You are not permitted to use this command.";
      
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
          i++;
        }
        if (i < calendar.events.length) {
          resultString += "\n[Upcoming Events]\n\n";
        }
        while (i < calendar.events.length) {
          resultString += `${i+1} : ${calendar.events[i].name} /* ${moment(calendar.events[i].startDate).tz(calendar.timezone).toString()} to ${moment(calendar.events[i].endDate).tz(calendar.timezone).toString()} */\n`;
          i++;
        }
      }
      resultString += "```";
      return resultString;
    } catch (err) {
      return err;
    }
  }

  public deleteEvent = async (msg: Message, args: string[]): Promise<string> => {
    try {
      if (args.length < 1 || args.length > 1) return "Usage: `event delete <eventIndex>` (eventIndex can be checked by running `event list`)";

      let index: number = parseInt(args[0]);
      if (isNaN(index)) return "Usage: `event delete <eventIndex>` (eventIndex can be checked by running `event list`)";

      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar) return "Calendar not found. Run `init <timezone>` to initialise the guild calendar."
      if (!calendar.checkPerm('event.delete', msg)) return "You are not permitted to use this command.";

      index--;
      if (index < 0 || index >= calendar.events.length) return "Event not found.";

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
      return err;
    }
  }

  public updateEvent = async (msg: Message, args: string[]): Promise<string> => {
    try {
      let now: moment.Moment = moment();
      if (args.length < 2) return "Usage: `event update <eventIndex> <eventData>` (eventIndex can be checked by running `event list`)";

      let index: number = parseInt(args[0]);
      if (isNaN(index)) return "Usage: `event update <eventIndex> <eventData>` (eventIndex can be checked by running `event list`)";

      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar) return "Calendar not found. Run `init <timezone>` to initialise the guild calendar.";
      if (!calendar.checkPerm('event.update', msg)) return "You are not permitted to use this command.";

      index--;
      let inputString: string = args.slice(1).join(' ');
      let results: any = chrono.parse(inputString);
      if (!results[0]) return "Failed to parse event data.";

      let eventName: string = inputString.replace(results[0].text, "").trim();
      // If no date supplied by user, assign the current date based on the timezone
      if (results[0].start.impliedValues.day && results[0].start.impliedValues.month && results[0].start.impliedValues.year) {
        let nowWithTimezone: moment.Moment = now.tz(calendar.timezone);
        results[0].start.impliedValues.day = nowWithTimezone.date();
        results[0].start.impliedValues.month = nowWithTimezone.month() + 1;
        results[0].start.impliedValues.year = nowWithTimezone.year();
      }
      let startDate: moment.Moment = moment(results[0].start.date());
      let endDate: moment.Moment = results[0].end ? moment(results[0].end.date()) : startDate.clone().add(1, 'h');
      if (now.diff(startDate) > 0) return "Cannot update to an event that starts or ends in the past.";
      if (index < 0 || index >= calendar.events.length) return "Event not found.";
      if (now.diff(moment(calendar.events[index].startDate)) > 0) return "Cannot update an event that is currently active.";

      await calendar.updateEvent(index, eventName, startDate, endDate);
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
            value: eventName
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
        content: "Event updated.",
        embed: embed
      });
    } catch (err) {
      return err;
    }
  }

  public registerCommands(): boolean {
    this.bot.registerCommand("init", this.initializeCalendar, this.commandOptions);
    let eventAddCommand: Command = this.bot.registerCommand("event", this.addEvent, this.commandOptions);
    eventAddCommand.registerSubcommand("list", this.listEvents, this.commandOptions);
    eventAddCommand.registerSubcommand("delete", this.deleteEvent, this.commandOptions);
    eventAddCommand.registerSubcommand("update", this.updateEvent, this.commandOptions);
    return true;
  }
}

export default CalendarController;