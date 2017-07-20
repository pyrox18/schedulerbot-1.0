const moment = require('moment-timezone');

const calendar = require('../modules/calendar.module');
const config = require('../config/bot.config');

module.exports = (bot) => {
  bot.registerCommand("calendar", (msg, args) =>  {
    if (args.length > 1 || args.length < 1) {
      return "Invalid input.";
    }

    if(moment.tz.zone(args[0]) === null) {
      return "Timezone not found. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List under the TZ column for available timezones.";
    }

    calendar.initCalendar(bot, msg, args);
  }, {
    description: "Initialise calendar.",
    fullDescription: "Initialises a calendar for the guild in the specified timezone.",
    usage: "`<timezone>`"
  });
}