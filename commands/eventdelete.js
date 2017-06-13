const Calendars = require('../models/calendars');

const config = require('../config/bot');
const prefix = config.prefix;

module.exports = (bot) => {
  bot.registerCommand("eventdelete", (msg, args) => {
    if (args.length < 1 || args.length > 1) {
      return "Invalid input.";
    }
    
    let calendars = new Calendars();

    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Invalid input.";
    }
    index = index - 1;

    let resultCode = calendars.deleteEvent(msg.channel.guild.id, index);
    switch (resultCode) {
      case -1:
        return "Calendar not initialized. Please run `" + prefix + "calendar` to initialize the calendar first.";
      case 0:
        return "Event not found.";
      default:
        return "Event successfully deleted.";
    }
  }, {
    description: "Delete an event.",
    fullDescription: "Delete an event from the existing event list.",
    usage: "`<event number>`"
  });
}