const moment = require('moment-timezone');
const schedule = require('node-schedule');
const dict = require('dict');
require('eris-embed-builder');

class Scheduler {
  constructor() {
    this.notifierJobs = dict();
    this.deleteJobs = dict();
  }

  scheduleExistingEvents(bot, calendar) {
    let now = moment();
    for (let event of calendar.events) {
      if (now.diff(moment(event.startDate)) <= 0) { // Schedule notifier job only if event hasn't started
        this.notifierJobs.set(event._id.toString(), schedule.scheduleJob(moment(event.startDate).toDate(), () => {
          let embed = bot.createEmbed(calendar.defaultChannel);
          embed.title("Event starting now!");
          embed.color(0x14ff47);
          embed.field("Event Name", event.name, false);
          embed.field("Start Date", moment(event.startDate).tz(calendar.timezone).toString(), false);
          embed.field("End Date", moment(event.endDate).tz(calendar.timezone).toString(), false);

          embed.send(bot, calendar.defaultChannel);
          bot.createMessage(calendar.defaultChannel, `${event.name} starting now!`);
        }));
      }

      if (now.diff(moment(event.endDate)) <= 0) { // Schedule delete job if event hasn't ended
        this.deleteJobs.set(event._id.toString(), schedule.scheduleJob(moment(event.endDate).toDate(), () => {
          calendar.deleteEventById(event._id.toString(), err => {
            if (err) {
              throw new Error('Failed to delete event by ID in Scheduler.scheduleExistingEvents: ' + err);
            }
          });
        }));
      }
      else { // Remove event from calendar
        calendar.deleteEventById(event._id.toString(), err => {
          if (err) {
            throw new Error('Failed to delete event by ID in Scheduler.scheduleExistingEvents: ' + err);
          }
        });
      }
    }
  }

  scheduleEvent(bot, calendar, event) {
    this.notifierJobs.set(event._id.toString(), schedule.scheduleJob(moment(event.startDate).toDate(), () => {
      let embed = bot.createEmbed(calendar.defaultChannel);
      embed.title("Event starting now!");
      embed.color(0x14ff47);
      embed.field("Event Name", event.name, false);
      embed.field("Start Date", moment(event.startDate).tz(calendar.timezone).toString(), false);
      embed.field("End Date", moment(event.endDate).tz(calendar.timezone).toString(), false);

      embed.send(bot, calendar.defaultChannel);
      bot.createMessage(calendar.defaultChannel, `${event.name} starting now!`);
    }));
    this.deleteJobs.set(event._id.toString(), schedule.scheduleJob(moment(event.endDate).toDate(), function() {
      calendar.deleteEventById(event._id.toString(), err => {
        if (err) {
          throw new Error('Failed to delete event by ID in Scheduler.scheduleEvent: ' + err);
        }
      });
    }));
  }

  unscheduleEvent(eventId) {
    let job1 = this.notifierJobs.get(eventId);
    let job2 = this.deleteJobs.get(eventId);
    if (job1) {
      job1.cancel();
      this.notifierJobs.delete(eventId);
    }
    if (job2) {
      job2.cancel();
      this.deleteJobs.delete(eventId);
    }
  }
}

module.exports = new Scheduler();