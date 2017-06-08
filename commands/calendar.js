const jsonfile = require('jsonfile');
const path = require('path');
const moment = require('moment-timezone');

const Calendar = require('../models/calendar');

const config = require('../config/bot');
const file = path.join(appRoot + "/" + config.calendarJsonFile);

module.exports = (bot) => {
  bot.registerCommand("calendar", (msg, args) =>  {
    if (args.length > 1 || args.length < 1) {
      return "Invalid input.";
    }

    let calendars;

    try {
      calendars = jsonfile.readFileSync(file);
    }
    catch (err) {
      calendars = [];
    }

    let timezone = args[0];
    let calendarExists = false;
    for (let i of calendars) {
      if (i.guildId == msg.channel.guild.id) {
        calendarExists = true;
        break;
      }
    }

    if (calendarExists) {
      return "The guild calendar has already been initialised.";
    }
    else {
      console.log(timezone);
      if (moment.tz.zone(timezone) === null) {
        return "Timezone not found. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List under the TZ column for available timezones.";
      }
      else {
        calendars.push(new Calendar(msg.channel.guild.id, timezone));
        console.log(calendars);
        try {
          jsonfile.writeFileSync(file, calendars);
          return "Initialised calendar for guild ID " + msg.channel.guild.id + " with timezone " + timezone + ".";
        }
        catch (err) {
          console.error("File write failure: " + err);
        }
        
      }
    }
  }, {
    description: "Initialise calendar.",
    fullDescription: "Initialises a calendar for the guild."
  });
}