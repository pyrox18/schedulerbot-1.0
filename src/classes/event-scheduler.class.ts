import { EmbedBase } from "eris";
import * as moment from "moment-timezone";
import { Types } from "mongoose";
import { cancelJob, Job, scheduleJob } from "node-schedule";
import * as winston from "winston";

import { EventEmbedFactory } from "../classes/event-embed-factory.class";
import { JobMap } from "../classes/job-map.class";
import { CalendarDocument, CalendarModel as Calendar } from "../models/calendar.model";
import { EventDocument } from "../models/event.model";
import { SchedulerBot } from "./schedulerbot.class";

export class EventScheduler {
  private notifierJobs: JobMap;
  private deleteJobs: JobMap;
  private bot: SchedulerBot;
  private eventEmbedFactory: EventEmbedFactory;

  public constructor(bot: SchedulerBot) {
    this.notifierJobs = new JobMap();
    this.deleteJobs = new JobMap();
    this.bot = bot;
    this.eventEmbedFactory = new EventEmbedFactory();
  }

  public scheduleExistingEvents(calendar: CalendarDocument): void {
    const now: moment.Moment = moment();
    for (const event of calendar.events) {
      if (now.diff(moment(event.startDate)) <= 0) {
        this.scheduleNotifierJob(calendar, event);
      }

      if (now.diff(moment(event.endDate)) <= 0) {
        this.scheduleDeleteJob(calendar._id, event);
      }
    }
  }

  public scheduleEvent(calendar: CalendarDocument, event: EventDocument): void {
    this.scheduleNotifierJob(calendar, event);
    this.scheduleDeleteJob(calendar._id, event);
  }

  public unscheduleEvent(event: EventDocument) {
    this.unscheduleNotifierJob(event);
    this.unscheduleDeleteJob(event);
  }

  public rescheduleEvent(calendar: CalendarDocument, event: EventDocument) {
    this.unscheduleEvent(event);
    this.scheduleEvent(calendar, event);
  }

  private scheduleNotifierJob = (calendar: CalendarDocument, event: EventDocument): void => {
    const eventID: Types.ObjectId = event._id;
    const notifierJob: Job = scheduleJob(event.startDate, (): void => {
      const embed: EmbedBase = this.eventEmbedFactory.getNotifyEventEmbed(event, calendar.timezone);
      this.bot.createMessage(calendar.defaultChannel, { embed });
    });

    this.notifierJobs.set(eventID, notifierJob);
  }

  private scheduleDeleteJob(guildID: string, event: EventDocument): void {
    const eventID = event._id;
    const deleteJob: Job = scheduleJob(event.endDate, async (): Promise<void> => {
      try {
        const lock = await this.bot.calendarLock.acquire(guildID);
        const calendar: CalendarDocument = await Calendar.findById(guildID).exec();
        const repeatEvent = await calendar.scheduledDeleteEvent(eventID.toHexString());
        if (repeatEvent) {
          this.rescheduleEvent(calendar, event);
        }
        await lock.release();
      } catch (err) {
        winston.log("error", err);
      }
    });

    this.deleteJobs.set(eventID, deleteJob);
  }

  private unscheduleNotifierJob(event: EventDocument) {
    const eventID = event._id;
    const job: Job = this.notifierJobs.get(eventID);
    if (job) {
      cancelJob(job);
      this.notifierJobs.delete(eventID);
    }
  }

  private unscheduleDeleteJob(event: EventDocument) {
    const eventID = event._id;
    const job: Job = this.deleteJobs.get(eventID);
    if (job) {
      cancelJob(job);
      this.deleteJobs.delete(eventID);
    }
  }
}

export default EventScheduler;
