const moment = require('moment-timezone');

const Calendars = require('../models/calendars');

const config = require('../config/bot');
const prefix = config.prefix;

module.exports = (bot) => {
  bot.registerCommand("eventlist", (msg, args) => {
    if (args.length > 0) {
      return "Invalid input.";
    }
    
    let calendars = new Calendars();

    events = calendars.getEventsForCalendar(msg.channel.guild.id);

    if (events === null) {
      return "Calendar not initialized. Please run `" + prefix + "calendar` to initialize the calendar first.";
    }
    else {
      resultString = "**[Events]**\n\n";
      for (let i = 0; i < events.length; i++) {
        resultString = resultString + `${i+1} : ${events[i].name} - ${events[i].startDate} to ${events[i].endDate}\n`;
      }

      return resultString;
    }
  }, {
    description: "List existing events.",
    fullDescription: "Displays a list of events that have been created."
  });
}