const calendar = require('../modules/calendar.module');
const config = require('../config/bot.config');
const cmdDesc = require('../assets/command-desc.js');

module.exports = (bot) => {
  let eventCommand = bot.registerCommand("event", (msg, args) => {
    if (args.length < 1) {
      return "Invalid input.";
    }

    calendar.addEvent(bot, msg, args.join(" "));
  }, cmdDesc.event.add);

  eventCommand.registerSubcommand("list", (msg, args) => {
    if (args.length > 0) {
      return "Invalid input.";
    }

    calendar.listEvents(bot, msg);
  }, cmdDesc.event.list);

  eventCommand.registerSubcommand("delete", (msg, args) => {
    if (args.length < 1 || args.length > 1) {
      return "Invalid input.";
    }
    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Invalid input.";
    }

    calendar.deleteEvent(bot, msg, index);
  }, cmdDesc.event.delete);

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
  }, cmdDesc.event.update);
}