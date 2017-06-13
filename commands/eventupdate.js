const chrono = require('chrono-node');
const moment = require('moment-timezone');
require('eris-embed-builder');

const Calendars = require('../models/calendars');

const config = require('../config/bot');
const prefix = config.prefix;

module.exports = (bot) => {
  bot.registerCommand("eventupdate", (msg, args) => {
    if (args.length < 2) {
      return "Invalid input.";
    }

    let calendars = new Calendars();

    let index = parseInt(args[0]);
    if (isNaN(index)) {
      return "Invalid input.";
    }
    index = index - 1;

    let inputString = args.slice(1).join(" ");
    let results = chrono.parse(inputString);

    let eventName = inputString.replace(results[0].text, "").trim();
    let startDate = moment(results[0].start.date());
    let endDate;
    try {
      endDate = moment(results[0].end.date());
    }
    catch (err) {
      endDate = startDate.clone().add(1, 'h');
    }

    let updateSuccessObject = calendars.updateEvent(msg.channel.guild.id, index, eventName, startDate, endDate);

    if (updateSuccessObject === null) {
      return "Calendar not initialized or event not found.";
    }
    else {
      let embed = bot.createEmbed(msg.channel.id);
      embed.title("New Event");
      embed.color(0xfff835);
      embed.field("Event Name", eventName, false);
      embed.field("Start Date", updateSuccessObject.actualStartDate.format('MMM D YYYY, h:mm:ss a z'), false);
      embed.field("End Date", updateSuccessObject.actualEndDate.format('MMM D YYYY, h:mm:ss a z'), false);

      embed.send(bot, msg.channel.id);
      return "Event updated.";
    }
  }, {
    description: "Update an existing event.",
    fullDescription: "Updates an existing event in the guild calendar.",
    usage: "`<event number> <event details>`"
  });
}