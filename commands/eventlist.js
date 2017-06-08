const path = require('path');
const jsonfile = require('jsonfile');
const moment = require('moment-timezone');

const config = require('../config/bot');
const prefix = config.prefix;
const file = path.join(appRoot + "/" + config.calendarJsonFile);

module.exports = (bot) => {
  bot.registerCommand("eventlist", (msg, args) => {
    if (args.length > 0) {
      return "Invalid input.";
    }
    
    let calendars;

    try {
      calendars = jsonfile.readFileSync(file);
    }
    catch (err) {
      return "An error has occurred.\n`" + err + "`";
    }

    for (let i of calendars) {
      if (i.guildId === msg.channel.guild.id) {
        let resultString = "";

        for (let event of i.events) {
          let start = moment.tz(event.startDate, i.timezone).format('MMM D YYYY, h:mm:ss a z');
          let end = moment.tz(event.endDate, i.timezone).format('MMM D YYYY, h:mm:ss a z');

          resultString = resultString + "**" + event.name + "**: " + start + " to " + end + "\n";
        }

        return resultString;
      }
    }

    return "Calendar not initialized. Please run `" + prefix + "calendar` to initialize the calendar first.";
  }, {
    description: "List existing events.",
    fullDescription: "Displays a list of events that have been created."
  });
}