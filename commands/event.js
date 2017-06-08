const path = require('path');
const jsonfile = require('jsonfile');
const chrono = require('chrono-node');
const moment = require('moment-timezone');
require('eris-embed-builder');

const CalendarEvent = require('../models/calendar-event');

const config = require('../config/bot');
const prefix = config.prefix;
const file = path.join(appRoot + "/" + config.calendarJsonFile);

module.exports = (bot) => {
  bot.registerCommand("event", (msg, args) => {
    if (args.length < 1) {
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
      if (i.guildId == msg.channel.guild.id) {
        let inputString = args.join(" ");
        let results = chrono.parse(inputString);

        inputString = inputString.replace(results[0].text, "");
        inputString = inputString.trim();

        let eventName = inputString;
        let startDate = moment(results[0].start.date());
        let endDate;
        try {
          endDate = moment(results[0].end.date());
        }
        catch (err) {
          endDate = startDate.add(1, 'h');
        }

        let actualStartDate = moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, i.timezone);
        let actualEndDate = moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, i.timezone);

        i.events.push(new CalendarEvent(eventName, actualStartDate, actualEndDate));
        try {
          jsonfile.writeFileSync(file, calendars)
        }
        catch (err) {
          console.error("File write error: " + err);
        }

        let embed = bot.createEmbed(msg.channel.id);
        embed.title("New Event");
        embed.color(0x7caeff);
        embed.field("Event Name", eventName, false);
        embed.field("Start Date", actualStartDate.format('MMM D YYYY, h:mm:ss a z'), false);
        embed.field("End Date", actualEndDate.format('MMM D YYYY, h:mm:ss a z'), false);
        
        embed.send(bot, msg.channel.id);
        return "New event created.";
      }
    }

    return "Calendar not initialized. Please run `" + prefix + "calendar` to initialize the calendar first.";

  });
}