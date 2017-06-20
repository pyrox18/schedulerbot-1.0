const mongoose = require('mongoose');
const moment = require('moment-timezone');

let calendarSchema = mongoose.Schema({
  _id: String,
  timezone: String,
  events: [{
    name: String,
    startDate: String,
    endDate: String
  }],
  prefix: String
  // permissions: [{ ??? }]
}, {
  _id: false
});

calendarSchema.statics.findByGuildId = function(guildId, callback) {
  return this.findOne({ _id: guildId }, callback);
}

calendarSchema.methods.addEvent = function(eventName, startDate, endDate, callback) {
  let actualStartDate = moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.timezone);
  let actualEndDate = moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, this.timezone);

  let event = {
    name: eventName,
    startDate: actualStartDate.toISOString(),
    endDate: actualEndDate.toISOString()
  }

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

  this.save(callback);
}

calendarSchema.methods.deleteEvent = function(eventIndex, callback) {
  if (eventIndex >= 0 && eventIndex < this.events.length) {
    this.events.splice(eventIndex, 1);
    this.save(callback);
  }
}

calendarSchema.methods.updateEvent = function(eventIndex, eventName, startDate, endDate, callback) {
  if (eventIndex >= 0 && eventIndex < this.events.length) {
    this.events.splice(eventIndex, 1);
    this.addEvent(eventName, startDate, endDate, callback);
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