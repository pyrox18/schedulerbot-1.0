const chrono = require('chrono-node');
const moment = require('moment-timezone');
require('eris-embed-builder');

const Calendar = require('../models/calendar.model');

const config = require('../config/bot.config');

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

    Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        console.error(err);
        return;
      }
      if (!calendar) {
        msg.channel.createMessage("Calendar not initialized. Please run `" + config.prefix + "calendar` to initialize the calendar first.");
      }
      else {
        calendar.addEvent(eventName, startDate, endDate, (err, calendar) => {
          if (err) {
            console.error(err);
          }
          else {
            let embed = bot.createEmbed(msg.channel.id);
            embed.title("New Event");
            embed.color(0x7caeff);
            embed.field("Event Name", eventName, false);
            embed.field("Start Date", moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, calendar.timezone).toString(), false);
            embed.field("End Date", moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, calendar.timezone).toString(), false);

            embed.send(bot, msg.channel.id);
            msg.channel.createMessage("New event created.");
          }
        });
      }
    });
  }, {
    description: "Add a new event.",
    fullDescription: "Adds a new event to the guild calendar. Type the event details naturally (e.g. 'CS:GO scrims tomorrow from 6pm to 9pm') and the bot will interpret it for you.",
    usage: "`<event details>`"
  });

  eventCommand.registerSubcommand("list", (msg, args) => {
    if (args.length > 0) {
      return "Invalid input.";
    }

    Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        console.error(err);
        return;
      }
      if (!calendar) {
        msg.channel.createMessage("Calendar not initialized. Please run `" + config.prefix + "calendar` to initialize the calendar first.");
      }
      else {
        let resultString = "```css\n[Events]\n\n";

        if (calendar.events.length == 0) {
          resultString = resultString + "No events found!\n";
        }
        else {
          for (let i = 0; i < calendar.events.length; i++) {
            resultString = resultString + `${i+1} : ${calendar.events[i].name} /* ${moment(calendar.events[i].startDate).tz(calendar.timezone).toString()} to ${moment(calendar.events[i].endDate).tz(calendar.timezone).toString()} */\n`;
          }
        }
        resultString = resultString + "```";
        msg.channel.createMessage(resultString);
      }
    });
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

    Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
      if (index < 0 || index >= calendar.events.length) {
        msg.channel.createMessage("Event not found.");
      }
      else {
        let deletedEvent = calendar.events[index];
        calendar.deleteEvent(index, (err) => {
          if (err) {
            console.error(err);
            return;
          }
          let embed = bot.createEmbed(msg.channel.id);
          embed.title("Delete Event");
          embed.color(0xff2b2b);
          embed.field("Event Name", deletedEvent.name, false);
          embed.field("Start Date", moment(deletedEvent.startDate).tz(calendar.timezone).toString(), false);
          embed.field("End Date", moment(deletedEvent.endDate).tz(calendar.timezone).toString(), false);

          embed.send(bot, msg.channel.id);
          msg.channel.createMessage("Event deleted.");
        })
      }
    });
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

    Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        console.error(err);
        return;
      }
      if (!calendar) {
        msg.channel.createMessage("Calendar not initialized. Please run `" + config.prefix + "calendar` to initialize the calendar first.");
      }
      else {
        if (index < 0 || index >= calendar.events.length) {
          msg.channel.createMessage("Event not found.");
        }
        else {
          calendar.updateEvent(index, eventName, startDate, endDate, (err, calendar) => {
            if (err) {
              console.error(err);
            }
            else {
              let embed = bot.createEmbed(msg.channel.id);
              embed.title("Update Event");
              embed.color(0xfff835);
              embed.field("Event Name", eventName, false);
              embed.field("Start Date", moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, calendar.timezone).toString(), false);
              embed.field("End Date", moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, calendar.timezone).toString(), false);

              embed.send(bot, msg.channel.id);
              msg.channel.createMessage("Event updated.");
            }
          });
        }
      }
    });
  }, {
    description: "Update an existing event.",
    fullDescription: "Updates an existing event in the guild calendar.",
    usage: "`<event number> <event details>`"
  });
}