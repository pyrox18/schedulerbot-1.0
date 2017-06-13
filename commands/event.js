const chrono = require('chrono-node');
const moment = require('moment-timezone');
require('eris-embed-builder');

const Calendars = require('../models/calendars');

const config = require('../config/bot');
const prefix = config.prefix;

module.exports = (bot) => {
  bot.registerCommand("event", (msg, args) => {
    if (args.length < 1) {
      return "Invalid input.";
    }

    let calendars = new Calendars();

    let inputString = args.join(" ");
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

    let addSuccessObject = calendars.addEventToCalendar(msg.channel.guild.id, eventName, startDate, endDate);

    if (addSuccessObject === null) {
      return "Calendar not initialized. Please run `" + prefix + "calendar` to initialize the calendar first.";
    }
    else {
      let embed = bot.createEmbed(msg.channel.id);
      embed.title("New Event");
      embed.color(0x7caeff);
      embed.field("Event Name", eventName, false);
      embed.field("Start Date", addSuccessObject.actualStartDate.format('MMM D YYYY, h:mm:ss a z'), false);
      embed.field("End Date", addSuccessObject.actualEndDate.format('MMM D YYYY, h:mm:ss a z'), false);

      embed.send(bot, msg.channel.id);
      return "New event created.";
    }
  }, {
    description: "Add a new event.",
    fullDescription: "Adds a new event to the guild calendar. Type the event details naturally (e.g. 'CS:GO scrims tomorrow from 6pm to 9pm') and the bot will interpret it for you.",
    usage: "`<event details>`"
  });
}