const moment = require('moment-timezone');

const Calendar = require('../models/calendar.model');
const config = require('../config/bot.config');

module.exports = (bot) => {
  bot.registerCommand("calendar", (msg, args) =>  {
    if (args.length > 1 || args.length < 1) {
      return "Invalid input.";
    }

    if(moment.tz.zone(args[0]) === null) {
      return "Timezone not found. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List under the TZ column for available timezones.";
    }

    Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        console.error(err);
      }
      
      if (!calendar) {
        let newCal = new Calendar({
          _id: msg.channel.guild.id,
          timezone: args[0],
          prefix: config.prefix
        });
        newCal.save((err, calendar) => {
          if (err) {
            console.error(err);
          }
          else {
            msg.channel.createMessage(`Set calendar timezone to ${calendar.timezone}.`);
          }
        });
      }
      else {
        if (calendar.timezone) {
          msg.channel.createMessage("The calendar timezone has already been set.");
        }
        else {
          calendar.updateTimezone(args[0], err => {
            if (err) {
              console.error(err);
            }
            else {
              msg.channel.createMessage(`Set calendar timezone to ${calendar.timezone}.`);
            }
          });
        }
      }
    });
  }, {
    description: "Initialise calendar.",
    fullDescription: "Initialises a calendar for the guild in the specified timezone.",
    usage: "`<timezone>`"
  });
}