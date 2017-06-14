const path = require('path');
const jsonfile = require('jsonfile');
const moment = require('moment-timezone');

const config = require('../config/bot');

class Calendars {
  constructor() {
    this.calendars = [];
    this.readCalendars();
  }

  addCalendar(guildId, timezone) {
    if (this.findIndexOfCalendar(guildId) >= 0) {
      return -1;
    }
    else if (moment.tz.zone(timezone) === null) {
      return -2;
    }
    else {
      this.calendars.push(new Calendar(guildId, timezone));
      this.writeCalendars();
      return 1;
    }
  }

  getEventsForCalendar(guildId) { 
    let index = this.findIndexOfCalendar(guildId);

    if (index < 0) {
      return null;
    }
    else {
      let events = [];

      for (let event of this.calendars[index].events) {
        let startDate = moment.tz(event.startDate, this.calendars[index].timezone).format('MMM D YYYY, h:mm:ss a z');
        let endDate = moment.tz(event.endDate, this.calendars[index].timezone).format('MMM D YYYY, h:mm:ss a z');

        events.push({
          name: event.name,
          startDate: startDate,
          endDate: endDate
        });
      }

      return events;
    }
  }

  addEventToCalendar(guildId, eventName, localStartDate, localEndDate) {
    let index = this.findIndexOfCalendar(guildId);

    if (index < 0) {
      return null;
    }
    else {
      let actualStartDate = moment.tz(localStartDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.calendars[index].timezone);
      let actualEndDate = moment.tz(localEndDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.calendars[index].timezone);

      if (this.calendars[index].events.length == 0) {
        this.calendars[index].events.push(new CalendarEvent(eventName, actualStartDate, actualEndDate));
      }
      else {
        for (let i = 0; i < this.calendars[index].events.length; i++) {
          if (moment.tz(this.calendars[index].events[i].startDate, this.calendars[index].timezone).diff(actualStartDate) >= 0) {
            this.calendars[index].events.splice(i, 0, new CalendarEvent(eventName, actualStartDate, actualEndDate));
            break;
          }
          if (i == this.calendars[index].events.length - 1) {
            this.calendars[index].events.push(new CalendarEvent(eventName, actualStartDate, actualEndDate));
            break;
          }
        }
      }
      this.writeCalendars();
      return {
        eventName: eventName,
        actualStartDate: actualStartDate,
        actualEndDate: actualEndDate
      };
    }
  }

  deleteEvent(guildId, eventIndex) {
    let index = this.findIndexOfCalendar(guildId);
    if (index < 0 || eventIndex < 0 || eventIndex >= this.calendars[index].events.length) {
      return null;
    }
    else {
      let result = this.calendars[index].events.splice(eventIndex, 1);
      this.writeCalendars();

      return {
        eventName: result[0].name,
        actualStartDate: moment.tz(result[0].startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.calendars[index].timezone),
        actualEndDate: moment.tz(result[0].endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.calendars[index].timezone)
      };
    }
  }

  updateEvent(guildId, eventIndex, eventName, localStartDate, localEndDate) {
    let index = this.findIndexOfCalendar(guildId);

    if (index < 0 || eventIndex < 0 || eventIndex >= this.calendars[index].events.length) {
      return null;
    }
    else {
      let actualStartDate = moment.tz(localStartDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.calendars[index].timezone);
      let actualEndDate = moment.tz(localEndDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.calendars[index].timezone);

      this.calendars[index].events[eventIndex] = new CalendarEvent(eventName, actualStartDate, actualEndDate);
      this.writeCalendars();
      return {
        eventName: eventName,
        actualStartDate: actualStartDate,
        actualEndDate: actualEndDate
      };
    }
  }

  findIndexOfCalendar(guildId) {
    let index = this.calendars.findIndex((calendar) => {
      return calendar.guildId == guildId;
    });

    return index;
  }

  readCalendars() {
    let file = path.join(appRoot + '/' + config.calendarJsonFile);

    try {
      this.calendars = jsonfile.readFileSync(file);
    }
    catch (err) {
      console.error('File read error: ' + err);
      process.exit();
    }
  }

  writeCalendars() {
    let file = path.join(appRoot + '/' + config.calendarJsonFile);

    try {
      jsonfile.writeFileSync(file, this.calendars);
    }
    catch (err) {
      console.error('File write error: ' + err);
      process.exit();
    }
  }
}

class Calendar {
  constructor(guildId, timezone) {
    this.guildId = guildId;
    this.timezone = timezone;
    this.events = [];
  }
}

class CalendarEvent {
  constructor(name, startDate, endDate) {
    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
  }
}

module.exports = calendars = new Calendars();