const moment = require('moment-timezone');

// const Calendar = require('../models/calendar.model');
// const CommandError = require('../models/command-error.model');
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

    // Calendar.findById(msg.channel.guild.id, (err, calendar) => {
    //   calendarModify(err, calendar, bot, msg, args);
    // });
    calendar.initCalendar(bot, msg, args);
  }, {
    description: "Initialise calendar.",
    fullDescription: "Initialises a calendar for the guild in the specified timezone.",
    usage: "`<timezone>`"
  });
}

function calendarModify(err, calendar, bot, msg, args) {
  if (err) {
    new CommandError(err, bot, msg);
  }
  
  if (!calendar) {
    let newCal = new Calendar({
      _id: msg.channel.guild.id,
      timezone: args[0],
      prefix: config.prefix,
      defaultChannel: msg.channel.id
    });
    newCal.save((err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
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
      calendar.timezone = args[0];
      calendar.defaultChannel = msg.channel.id;
      calendar.save(err => {
        if (err) {
          new CommandError(err, bot, msg);
        }
        else {
          msg.channel.createMessage(`Set calendar timezone to ${calendar.timezone}.`);
        }
      });
    }
  }
}