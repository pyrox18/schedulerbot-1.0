import * as moment from 'moment-timezone';
import * as chrono from 'chrono-node';

import { FlagParser } from './flag-parser.class';
import { Event } from '../interfaces/event.interface';

export class EventParser {
  public static parse(args: string[], timezone: string, now: moment.Moment): Event {
    let event: Event = {
      name: null,
      startDate: null,
      endDate: null,
      description: null,
      repeat: null
    };

    let parsedArgs: any = FlagParser.parse(args);
    let inputString: string = parsedArgs._body;
    let results: any = chrono.parse(inputString);
    if (results[0]) {
      event.name = inputString.replace(results[0].text, "").trim();
      // If no date supplied by user, assign the current date based on the timezone
      if (results[0].start.impliedValues.day &&
          results[0].start.impliedValues.month &&
          results[0].start.impliedValues.year) {
        let nowWithTimezone: moment.Moment = now.tz(timezone);
        results[0].start.impliedValues.day = nowWithTimezone.date();
        results[0].start.impliedValues.month = nowWithTimezone.month() + 1;
        results[0].start.impliedValues.year = nowWithTimezone.year();
      }
      event.startDate = this.getOffsetMoment(moment(results[0].start.date()), timezone).toDate();
      event.endDate = results[0].end ? this.getOffsetMoment(moment(results[0].end.date()), timezone).toDate() : moment(event.startDate).add(1, 'h').toDate();
    }
    event.description = parsedArgs.desc || null;
    event.repeat = parsedArgs.repeat || null;

    return event;
  }

  private static getOffsetMoment(date: moment.Moment, timezone: string): moment.Moment {
    let another = date.clone();
    another.tz(timezone);
    another.add(date.utcOffset() - another.utcOffset(), 'minutes');
    return another;
  }
}