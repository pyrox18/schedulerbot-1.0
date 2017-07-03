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
  defaultChannel: String,
  permissions: [{
    node: String,
    allow: [{
      type: String,
      id: String
    }],
    deny: [{
      type: String,
      id: String
    }]
  }]
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

calendarSchema.methods.modifyPerm = function(node, type, id, perm, callback) {
  let index = this.permissions.findIndex(perms => {
    return perms.node = node;
  });

  if (index < 0) {
    this.permissions.push({
      node: node
    });
    index = this.permissions.length - 1;
  }

  if (perm != 'allow' && perm != 'deny') {
    throw new Error('Incorrect permission setting');
  }
  if (type != 'role' && type != 'user') {
    throw new Error('Incorrect user type setting');
  }

  if (perm == 'allow') {
    let object;
    let i = this.permissions[index].deny.findIndex(object => {
      return object.type == type && object.id == id;
    });
    if (i < 0) {
      object = {
        type: type,
        id: id
      }
    }
    else {
      object = this.permissions[index].deny.splice(i, 1);
    }
    this.permissions[index].allow.push(object);
  }

  if (perm == 'deny') {
    let object;
    let i = this.permissions[index].allow.findIndex(object => {
      return object.type == type && object.id == id;
    });
    if (i < 0) {
      object = {
        type: type,
        id: id
      }
    }
    else {
      object = this.permissions[index].allow.splice(i, 1);
    }
    this.permissions[index].deny.push(object);
  }

  this.save(callback);
}

module.exports = mongoose.model('Calendar', calendarSchema);