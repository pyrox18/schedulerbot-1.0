import { Message, GuildChannel } from 'eris';
import { Document, Schema, Model, model } from 'mongoose';
import * as moment from 'moment-timezone';

import { Calendar } from '../interfaces/calendar.interface';
import { EventDocument, EventSchema, EventModel as Event } from './event.model';
import { PermsDocument, PermsSchema, PermsModel as Perms } from './perms.model';
import { EventScheduler } from '../classes/event-scheduler.class';

export interface CalendarDocument extends Calendar, Document {
  _id: string;
  addEvent(eventName: string, startDate: moment.Moment, endDate: moment.Moment, eventDescription?: string): Promise<any>;
  deleteEvent(eventIndex: number): Promise<any>;
  deleteEventById(eventId: string): Promise<any>;
  updateEvent(eventIndex: number, eventName?: string, startDate?: moment.Moment, endDate?: moment.Moment, eventDescription?: string): Promise<EventDocument>;
  updatePrefix(prefix: string): Promise<any>;
  setTimezone(timezone: string): Promise<any>;
  denyRolePerm(roleId: string, node: string): Promise<any>;
  denyUserPerm(userId: string, node: string): Promise<any>;
  allowRolePerm(roleId: string, node: string): Promise<any>;
  allowUserPerm(userId: string, node: string): Promise<any>;
  checkPerm(node: string, msg: Message): boolean;
}

export let CalendarSchema: Schema = new Schema({
  _id: String,
  timezone: String,
  events: [EventSchema],
  prefix: String,
  defaultChannel: String,
  permissions: [PermsSchema]
}, {
  _id: false
});

CalendarSchema.methods.addEvent = function(eventName: string, startDate: moment.Moment, endDate: moment.Moment, eventDescription?: string): Promise<any> {
  let event: Document = new Event({
    name: eventName,
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
    description: eventDescription
  });

  let eventIndex: number;

  if (this.events.length == 0) {
    this.events.push(event);
    eventIndex = this.events.length - 1;
  }
  else {
    for (let i = 0; i < this.events.length; i++) {
      let element = this.events[i];
      if (moment(element.startDate).isSameOrAfter(startDate)) {
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

  EventScheduler.getInstance().scheduleEvent(this, this.events[eventIndex]);

  return this.save();
}

CalendarSchema.methods.deleteEvent = function(eventIndex: number): Promise<any> {
  if (eventIndex >= 0 && eventIndex < this.events.length) {
    let event: EventDocument = this.events.splice(eventIndex, 1);
    EventScheduler.getInstance().unscheduleEvent(event[0]);
    return this.save();
  }
  return Promise.reject("Event not found");
}

CalendarSchema.methods.deleteEventById = function(eventId: string): Promise<any> {
  let index: number = this.events.findIndex((event) => {
    return event._id.toString() == eventId;
  });
  this.events.splice(index, 1);
  return this.save();
}

CalendarSchema.methods.updateEvent = async function(eventIndex: number, eventName?: string, startDate?: moment.Moment, endDate?: moment.Moment, eventDescription?: string): Promise<EventDocument> {
  if (eventIndex >= 0 && eventIndex < this.events.length) {
    let eventArray: EventDocument[] = this.events.splice(eventIndex, 1);
    let event: EventDocument = eventArray[0];

    event.name = eventName || event.name;
    event.startDate = startDate ? startDate.toDate() : event.startDate;
    event.endDate = endDate ? endDate.toDate() : event.endDate;
    event.description = eventDescription || event.description;

    if (this.events.length == 0) {
      this.events.push(event);
    }
    else {
      for (let i = 0; i < this.events.length; i++) {
        if (moment(this.events[i].startDate).isSameOrAfter(event.startDate)) {
          this.events.splice(i, 0, event);
          break;
        }
        if (i == this.events.length - 1) {
          this.events.push(event);
          break;
        }
      }
    }

    EventScheduler.getInstance().rescheduleEvent(this, event);
    await this.save();
    return event;
  }
  return Promise.reject("Event not found");
}

CalendarSchema.methods.updatePrefix = function(prefix: string): Promise<any> {
  this.prefix = prefix;
  return this.save();
}

CalendarSchema.methods.setTimezone = function(timezone: string) {
  if (moment.tz.zone(timezone) === null) {
    return Promise.reject("Timezone not found");
  }
  else {
    this.timezone = timezone;
    return this.save();
  }
}

CalendarSchema.methods.denyRolePerm = function(roleId: string, node: string): Promise<any> {
  let index: number = this.permissions.findIndex(perm => {
    return perm.node == node;
  });
  if (index < 0) {
    this.permissions.push(new Perms({
      node: node,
      deniedRoles: [],
      deniedUsers: []
    }));
    index = this.permissions.length - 1;
  }

  if (!this.permissions[index].deniedRoles.find(id => { return roleId == id })) {
    this.permissions[index].deniedRoles.push(roleId);
  }

  return this.save();
}

CalendarSchema.methods.denyUserPerm = function(userId: string, node: string): Promise<any> {
  let index: number = this.permissions.findIndex(perm => {
    return perm.node == node;
  });
  if (index < 0) {
    this.permissions.push(new Perms({
      node: node,
      deniedRoles: [],
      deniedUsers: []
    }));
    index = this.permissions.length - 1;
  }

  if (!this.permissions[index].deniedUsers.find(id => { return userId == id })) {
    this.permissions[index].deniedUsers.push(userId);
  }

  return this.save();
}

CalendarSchema.methods.allowRolePerm = function(roleId: string, node: string): Promise<any> {
  let index: number = this.permissions.findIndex(perm => {
    return perm.node == node;
  });

  if (index >= 0) {
    let roleIndex: number = this.permissions[index].deniedRoles.findIndex(id => { return roleId == id })
    if (roleIndex >= 0) {
      this.permissions[index].deniedRoles.splice(roleIndex, 1);
    }
  }

  return this.save();
}

CalendarSchema.methods.allowUserPerm = function(userId: string, node: string): Promise<any> {
  let index: number = this.permissions.findIndex(perm => {
    return perm.node == node;
  });

  if (index >= 0) {
    let userIndex: number = this.permissions[index].deniedUsers.findIndex(id => { return userId == id });
    if (userIndex >= 0) {
      this.permissions[index].deniedUsers.splice(userIndex, 1);
    }
  }

  return this.save();
}

CalendarSchema.methods.checkPerm = function(node: string, msg: Message): boolean {
  let channel: GuildChannel = <GuildChannel>msg.channel;
  if (channel.guild.ownerID == msg.member.id) {
    return true;
  }

  let perm: PermsDocument = this.permissions.find(perm => { return perm.node == node; });
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

export let CalendarModel: Model<CalendarDocument> = model<CalendarDocument>("Calendar", CalendarSchema);
export default CalendarModel;