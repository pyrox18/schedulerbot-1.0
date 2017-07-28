const CommandError = require('../models/command-error.model');
const calendar = require('../modules/calendar.module');
const config = require('../config/bot.config');
const commandOptions = require('../assets/command-options');

module.exports = (bot) => {
  let eventCommand = bot.registerCommand("event", (msg, args) => {
    if (args.length < 1) {
      return "Usage: `event <event details>` Example: `event CSGO Scrims 7pm-9pm tomorrow`";
    }
    
    try {
      calendar.addEvent(bot, msg, args.join(" "));
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, commandOptions.event.add);

  eventCommand.registerSubcommand("list", (msg, args) => {
    if (args.length > 0) {
      return "Usage: `event list`";
    }

    try {
      calendar.listEvents(bot, msg);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, commandOptions.event.list);

  eventCommand.registerSubcommand("delete", (msg, args) => {
    if (args.length < 1 || args.length > 1) {
      return "Usage: `event delete <eventIndex>` (eventIndex can be checked by running `event list`)";
    }
    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Usage: `event delete <eventIndex>` (eventIndex can be checked by running `event list`)";
    }

    try {
      calendar.deleteEvent(bot, msg, index);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, commandOptions.event.delete);

  eventCommand.registerSubcommand("update", (msg, args) => {
    if (args.length < 2) {
      return "Usage: `event update <eventIndex> <event details>` (eventIndex can be checked by running `event list`)";
    }
    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Usage: `event update <eventIndex> <event details>` (eventIndex can be checked by running `event list`)";
    }

    try {
      let inputString = args.slice(1).join(" ");
      calendar.updateEvent(bot, msg, index, inputString);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }

  }, commandOptions.event.update);
}