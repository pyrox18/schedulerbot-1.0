import { EmbedBase } from 'eris';
import * as winston from 'winston';
import * as moment from 'moment-timezone';
import { Types } from 'mongoose';
import { scheduleJob, cancelJob, Job } from 'node-schedule';

import { SchedulerBot } from './schedulerbot.class';
import { CalendarDocument, CalendarModel as Calendar } from '../models/calendar.model';
import { EventDocument } from '../models/event.model';
import { Event } from '../interfaces/event.interface';
import { JobMap } from '../classes/job-map.class';
import { CalendarLock } from '../classes/calendar-lock.class';

// Acts as a singleton
export class EventScheduler {
  private notifierJobs: JobMap;
  private deleteJobs: JobMap;
  private bot: SchedulerBot;
  private static instance: EventScheduler = new EventScheduler();

  private constructor() {
    this.notifierJobs = new JobMap();
    this.deleteJobs = new JobMap();
    this.bot = SchedulerBot.getInstance();
  }

  public static getInstance(): EventScheduler {
    return this.instance;
  }

  public scheduleExistingEvents(calendar: CalendarDocument): void {
    let now: moment.Moment = moment();
    for (let event of calendar.events) {
      if (now.diff(moment(event.startDate)) <= 0) {
        this.scheduleNotifierJob(calendar, event);
      }

      if (now.diff(moment(event.endDate)) <= 0) {
        this.scheduleDeleteJob(calendar._id, event);
      }
    }
  }

  public scheduleEvent(calendar: CalendarDocument, event: EventDocument | Event): void {
    this.scheduleNotifierJob(calendar, event);
    this.scheduleDeleteJob(calendar._id, event);
  }

  public unscheduleEvent(event: EventDocument | Event) {
    this.unscheduleNotifierJob(event);
    this.unscheduleDeleteJob(event);
  }

  public rescheduleEvent(calendar: CalendarDocument, event: EventDocument | Event) {
    this.unscheduleEvent(event);
    this.scheduleEvent(calendar, event);
  }

  private scheduleNotifierJob = (calendar: CalendarDocument, event: EventDocument | Event): void => {
    let eventID: Types.ObjectId = event._id;
    let notifierJob: Job = scheduleJob(event.startDate, (): void => {
      let embed: EmbedBase = {
        title: "**Event starting now!**",
        color: 1376071,
        author: {
          name: "SchedulerBot",
          icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
        },
        fields: [
          {
            name: "Event Name",
            value: event.name
          },
          {
            name: "Description",
            value: event.description || "*N/A*"
          },
          {
            name: "Start Date",
            value: moment(event.startDate).tz(calendar.timezone).toString(),
            inline: true
          },
          {
            name: "End Date",
            value: moment(event.endDate).tz(calendar.timezone).toString(),
            inline: true
          },
          {
            name: "Repeat",
            value: event.repeat ? (event.repeat == "d" ? "Daily" : (event.repeat == "w" ? "Weekly" : "Monthly")) : "*N/A*"
          }
        ]
      }
      this.bot.createMessage(calendar.defaultChannel, { embed: embed });
    });

    this.notifierJobs.set(eventID, notifierJob);
  }

  private scheduleDeleteJob(guildID: string, event: EventDocument | Event): void {
    let eventID = event._id;
    let deleteJob: Job = scheduleJob(event.endDate, async (): Promise<void> => {
      try {
        let lock = await CalendarLock.acquire(guildID);
        let calendar: CalendarDocument = await Calendar.findById(guildID).exec();
        await calendar.scheduledDeleteEvent(eventID.toHexString());
        await lock.release();
      } catch (err) {
        winston.log('error', err);
      }
    });

    this.deleteJobs.set(eventID, deleteJob);
  }

  private unscheduleNotifierJob(event: EventDocument | Event) {
    let eventID = event._id;
    let job: Job = this.notifierJobs.get(eventID);
    if (job) {
      cancelJob(job);
      this.notifierJobs.delete(eventID);
    }
  }

  private unscheduleDeleteJob(event: EventDocument | Event) {
    let eventID = event._id;
    let job: Job = this.deleteJobs.get(eventID);
    if (job) {
      cancelJob(job);
      this.deleteJobs.delete(eventID);
    }
  }
}

export default EventScheduler;