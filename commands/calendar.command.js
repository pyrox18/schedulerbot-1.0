const moment = require('moment-timezone');

const Calendar = require('../models/calendar.model');

module.exports = (bot) => {
  bot.registerCommand("calendar", (msg, args) =>  {
    if (args.length > 1 || args.length < 1) {
      return "Invalid input.";
    }

    Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        console.error(err);
      }
      
      if (!calendar) {
        if(moment.tz.zone(args[0]) === null) {
          msg.channel.createMessage("Timezone not found. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List under the TZ column for available timezones.");
        }
        else {
          let newCal = new Calendar({
            guildId: msg.channel.guild.id,
            timezone: args[0]
          });
          newCal.save((err, calendar) => {
            msg.channel.createMessage(`Initialised calendar for guild ID ${calendar.guildId} with timezone ${calendar.timezone}.`);
          });
        }
      }
      else {
        msg.channel.createMessage("The guild calendar has already been initialised.");
      }
    });
  }, {
    description: "Initialise calendar.",
    fullDescription: "Initialises a calendar for the guild in the specified timezone.",
    usage: "`<timezone>`"
  });
}