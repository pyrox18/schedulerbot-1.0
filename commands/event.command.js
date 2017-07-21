const CommandError = require('../models/command-error.model');
const calendar = require('../modules/calendar.module');
const config = require('../config/bot.config');
const cmdDesc = require('../assets/command-desc.js');

module.exports = (bot) => {
  let eventCommand = bot.registerCommand("event", (msg, args) => {
    if (args.length < 1) {
      return "Invalid input.";
    }
    
    try {
      calendar.addEvent(bot, msg, args.join(" "));
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdDesc.event.add);

  eventCommand.registerSubcommand("list", (msg, args) => {
    if (args.length > 0) {
      return "Invalid input.";
    }

    try {
      calendar.listEvents(bot, msg);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdDesc.event.list);

  eventCommand.registerSubcommand("delete", (msg, args) => {
    if (args.length < 1 || args.length > 1) {
      return "Invalid input.";
    }
    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Invalid input.";
    }

    try {
      calendar.deleteEvent(bot, msg, index);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdDesc.event.delete);

  eventCommand.registerSubcommand("update", (msg, args) => {
    if (args.length < 2) {
      return "Invalid input.";
    }
    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Invalid input.";
    }

    try {
      let inputString = args.slice(1).join(" ");
      calendar.updateEvent(bot, msg, index, inputString);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }

  }, cmdDesc.event.update);
}