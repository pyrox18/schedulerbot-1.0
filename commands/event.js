const chrono = require('chrono-node');
const moment = require('moment-timezone');
require('eris-embed-builder');

let calendars = require('../modules/calendars');

const config = require('../config/bot');
const prefix = config.prefix;

module.exports = (bot) => {
  let eventCommand = bot.registerCommand("event", (msg, args) => {
    if (args.length < 1) {
      return "Invalid input.";
    }

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

  eventCommand.registerSubcommand("list", (msg, args) => {
    if (args.length > 0) {
      return "Invalid input.";
    }

    events = calendars.getEventsForCalendar(msg.channel.guild.id);

    if (events === null) {
      return "Calendar not initialized. Please run `" + prefix + "calendar` to initialize the calendar first.";
    }
    else {
      resultString = "```css\n[Events]\n\n";
      for (let i = 0; i < events.length; i++) {
        resultString = resultString + `${i+1} : ${events[i].name} /* ${events[i].startDate} to ${events[i].endDate} */\n`;
      }

      resultString = resultString + "```";
      return resultString;
    }
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

  eventCommand.registerSubcommand("update", (msg, args) => {
    if (args.length < 2) {
      return "Invalid input.";
    }

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
      embed.title("Update Event");
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