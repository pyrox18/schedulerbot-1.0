import * as winston from 'winston';

import { SchedulerBot } from '../classes/schedulerbot.class';
import { EventScheduler } from '../classes/event-scheduler.class';
import { CalendarModel as Calendar, CalendarDocument } from '../models/calendar.model';

export async function loadGuildData(): Promise<void> {
  try {
    let bot: SchedulerBot = SchedulerBot.instance;
    let scheduler: EventScheduler = EventScheduler.getInstance();
    let calendars: CalendarDocument[] = await Calendar.find().exec();
    for (let calendar of calendars) {
      let prefixes: string[] = [calendar.prefix, "@mention "];
      bot.registerGuildPrefix(calendar._id, prefixes);
      scheduler.scheduleExistingEvents(calendar);
    }
  } catch (err) {
    winston.error("Prefix load error", err);
  }
}

export default loadGuildData;