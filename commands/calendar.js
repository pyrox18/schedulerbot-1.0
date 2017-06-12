const Calendars = require('../models/calendars');

module.exports = (bot) => {
  bot.registerCommand("calendar", (msg, args) =>  {
    if (args.length > 1 || args.length < 1) {
      return "Invalid input.";
    }

    let calendars = new Calendars();

    let addCalStatus = calendars.addCalendar(msg.channel.guild.id, args[0]);
    switch (addCalStatus) {
      case -1:
        return "The guild calendar has already been initialised.";
      case -2:
        return "Timezone not found. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List under the TZ column for available timezones.";
      default:
        return "Initialised calendar for guild ID " + msg.channel.guild.id + " with timezone " + args[0] + ".";
    }
  }, {
    description: "Initialise calendar.",
    fullDescription: "Initialises a calendar for the guild."
  });
}