const calendar = require('../modules/calendar.module');
const config = require('../config/bot.config');

module.exports = (bot) => {
  let eventCommand = bot.registerCommand("event", (msg, args) => {
    if (args.length < 1) {
      return "Invalid input.";
    }

    calendar.addEvent(bot, msg, args.join(" "));
  }, {
    description: "Add a new event.",
    fullDescription: "Adds a new event to the guild calendar. Type the event details naturally (e.g. 'CS:GO scrims tomorrow from 6pm to 9pm') and the bot will interpret it for you.",
    usage: "`<event details>`"
  });

  eventCommand.registerSubcommand("list", (msg, args) => {
    if (args.length > 0) {
      return "Invalid input.";
    }

    calendar.listEvents(bot, msg);
  }, {
    description: "List existing events.",
    fullDescription: "Displays a list of events that have been created."
  });

  eventCommand.registerSubcommand("delete", (msg, args) => {
    if (args.length < 1 || args.length > 1) {
      return "Invalid input.";
    }
    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Invalid input.";
    }

    calendar.deleteEvent(bot, msg, index);
  }, {
    description: "Delete an event.",
    fullDescription: "Delete an event from the existing event list.",
    usage: "`<event number>`"
  });

  eventCommand.registerSubcommand("update", (msg, args) => {
    if (args.length < 2) {
      return "Invalid input.";
    }
    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Invalid input.";
    }

    let inputString = args.slice(1).join(" ");

    calendar.updateEvent(bot, msg, index, inputString);
  }, {
    description: "Update an existing event.",
    fullDescription: "Updates an existing event in the guild calendar.",
    usage: "`<event number> <event details>`"
  });
}