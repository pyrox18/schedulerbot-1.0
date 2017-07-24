const moment = require('moment-timezone');

const CommandError = require('../models/command-error.model');
const calendar = require('../modules/calendar.module');
const config = require('../config/bot.config');
const cmdOptions = require('../assets/command-options');

module.exports = (bot) => {
  bot.registerCommand("init", (msg, args) =>  {
    if (args.length > 1 || args.length < 1) {
      return "Invalid input.";
    }

    if(moment.tz.zone(args[0]) === null) {
      return "Timezone not found. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List under the TZ column for available timezones.";
    }

    try {
      calendar.initCalendar(bot, msg, args);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdOptions.calendar);
}