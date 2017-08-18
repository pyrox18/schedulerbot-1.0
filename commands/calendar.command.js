const moment = require('moment-timezone');

const CommandError = require('../models/command-error.model');
const calendar = require('../modules/calendar.module');
const config = require('../config/bot.config');
const cmdOptions = require('../assets/command-options');

module.exports = (bot) => {
  bot.registerCommand("init", (msg, args) =>  {
    calendar.initCalendar(msg, args, res => {
      if (res.error()) {
        return new CommandError(res.message, bot, msg);
      }
      if (res.reject()) {
        return msg.channel.createMessage("Usage: `init <timezone>`\nSee https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List under the TZ column for available timezones.");
      }
      if (res.success()) {
        if (res.meta.alreadyInit) {
          return msg.channel.createMessage("The calendar has already been initialised.");
        }
        else {
          return msg.channel.createMessage(`Initialised calendar to timezone ${res.meta.timezone}.`);
        }
      }
    });
  }, cmdOptions.calendar);
}