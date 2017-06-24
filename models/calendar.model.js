const mongoose = require('mongoose');
const moment = require('moment-timezone');

const scheduler = require('../modules/scheduler.module');

let calendarSchema = mongoose.Schema({
  _id: String,
  timezone: String,
  events: [{
    name: String,
    startDate: String,
    endDate: String
  }],
  prefix: String,
  defaultChannel: String
  // permissions: [{ ??? }]
}, {
  _id: false
});

calendarSchema.statics.findByGuildId = function(guildId, callback) {
  return this.findOne({ _id: guildId }, callback);
}

calendarSchema.methods.addEvent = function(bot, eventName, startDate, endDate, callback) {
  let actualStartDate = moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.timezone);
  let actualEndDate = moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.timezone);

  let event = {
    name: eventName,
    startDate: actualStartDate.toISOString(),
    endDate: actualEndDate.toISOString()
  }
  let eventIndex;

  if (this.events.length == 0) {
    this.events.push(event);
    eventIndex = this.events.length - 1;
  }
  else {
    for (let i = 0; i < this.events.length; i++) {
      if (this.events[i].startDate >= event.startDate) {
        this.events.splice(i, 0, event);
        eventIndex = i;
        break;
      }
      if (i == this.events.length - 1) {
        this.events.push(event);
        eventIndex = this.events.length - 1;
        break;
      }
    }
  }

  scheduler.scheduleEvent(bot, this, this.events[eventIndex]);

  this.save(callback);
}

calendarSchema.methods.deleteEvent = function(eventIndex, callback) {
  if (eventIndex >= 0 && eventIndex < this.events.length) {
    let event = this.events.splice(eventIndex, 1);
    scheduler.unscheduleEvent(event[0]._id.toString());
    this.save(callback);
  }
}

calendarSchema.methods.deleteEventById = function(eventId, callback) {
  let index = this.events.findIndex((event) => {
    return event._id.toString() == eventId;
  });
  this.events.splice(index, 1);
  this.save(callback);
}

calendarSchema.methods.updateEvent = function(eventIndex, eventName, startDate, endDate, callback) {
  if (eventIndex >= 0 && eventIndex < this.events.length) {
    let eventArray = this.events.splice(eventIndex, 1);
    let event = eventArray[0];
    let actualStartDate = moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.timezone);
    let actualEndDate = moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.timezone);

    event.name = eventName;
    event.startDate = actualStartDate.toISOString();
    event.endDate = actualEndDate.toISOString();

    if (this.events.length == 0) {
      this.events.push(event);
    }
    else {
      for (let i = 0; i < this.events.length; i++) {
        if (this.events[i].startDate >= event.startDate) {
          this.events.splice(i, 0, event);
          break;
        }
        if (i == this.events.length - 1) {
          this.events.push(event);
          break;
        }
      }
    }

    scheduler.unscheduleEvent(event._id.toString());
    scheduler.scheduleEvent(bot, this, event);
    this.save(callback);
  }
}

calendarSchema.methods.updatePrefix = function(prefix, callback) {
  this.prefix = prefix;
  this.save(callback);
}

calendarSchema.methods.setTimezone = function(timezone, callback) {
  if (moment.tz.zone(timezone) === null) {
    throw new Error("Timezone not found");
  }
  else {
    this.timezone = timezone;
    this.save(callback);
  }
}

module.exports = mongoose.model('Calendar', calendarSchema);