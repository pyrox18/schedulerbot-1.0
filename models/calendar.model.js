const mongoose = require('mongoose');
const moment = require('moment-timezone');

const scheduler = require('../modules/scheduler.module');

let eventSchema = mongoose.Schema({
  name: String,
  startDate: String,
  endDate: String
});

let permsSchema = mongoose.Schema({
  node: String,
  deniedRoles: [String],
  deniedUsers: [String]
});

let calendarSchema = mongoose.Schema({
  _id: String,
  timezone: String,
  events: [eventSchema],
  prefix: String,
  defaultChannel: String,
  permissions: [permsSchema]
}, {
  _id: false
});

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

calendarSchema.methods.denyRolePerm = function(roleId, node, callback) {
  let index = this.permissions.findIndex(perm => {
    return perm.node == node;
  });
  if (index < 0) {
    this.permissions.push({
      node: node,
      deniedRoles: [],
      deniedUsers: []
    });
    index = this.permissions.length - 1;
  }

  if (!this.permissions[index].deniedRoles.find(id => { return roleId == id })) {
    this.permissions[index].deniedRoles.push(roleId);
  }

  this.save(callback);
}

calendarSchema.methods.denyUserPerm = function(userId, node, callback) {
  let index = this.permissions.findIndex(perm => {
    return perm.node == node;
  });
  if (index < 0) {
    this.permissions.push({
      node: node,
      deniedRoles: [],
      deniedUsers: []
    });
    index = this.permissions.length - 1;
  }

  if (!this.permissions[index].deniedUsers.find(id => { return userId == id })) {
    this.permissions[index].deniedUsers.push(userId);
  }

  this.save(callback);
}

calendarSchema.methods.allowRolePerm = function(roleId, node, callback) {
  let index = this.permissions.findIndex(perm => {
    return perm.node == node;
  });

  if (index >= 0) {
    let roleIndex = this.permissions[index].deniedRoles.findIndex(id => { return roleId == id })
    if (roleIndex >= 0) {
      this.permissions[index].deniedRoles.splice(roleIndex, 1);
    }
  }

  this.save(callback);
}

calendarSchema.methods.allowUserPerm = function(userId, node, callback) {
  let index = this.permissions.findIndex(perm => {
    return perm.node == node;
  });

  if (index >= 0) {
    let userIndex = this.permissions[index].deniedUsers.findIndex(id => { return userId == id });
    if (userIndex >= 0) {
      this.permissions[index].deniedUsers.splice(userIndex, 1);
    }
  }

  this.save(callback);
}

calendarSchema.methods.checkPerm = function(node, msg) {
  if (msg.channel.guild.ownerID == msg.member.id) {
    return true;
  }

  let perm = this.permissions.find(perm => { return perm.node == node; });
  if (perm) {
    if (perm.deniedUsers.find(id => { return id == msg.member.id; })) { // Check if user is denied
      return false;
    }
    for (let roleId of perm.deniedRoles) { // Check if user's roles are denied
      if (msg.member.roles.find(id => { return id == roleId })) {
        return false;
      }
    }
  }

  return true; // Return true if user and user's roles are all not denied
}

module.exports = mongoose.model('Calendar', calendarSchema);