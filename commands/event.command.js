const chrono = require('chrono-node');
const moment = require('moment-timezone');
require('eris-embed-builder');

const Calendar = require('../models/calendar.model');

const config = require('../config/bot.config');

module.exports = (bot) => {
  let eventCommand = bot.registerCommand("event", (msg, args) => {
    let now = moment();
    
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

    if (now.diff(startDate) > 0) {
      return "Cannot create an event that starts in the past.";
    }

    Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        console.error(err);
        return;
      }
      if (!calendar || !calendar.timezone) {
        msg.channel.createMessage("Timezone not set. Run the `calendar <timezone>` command to set the timezone first.");
      }
      else {
        calendar.addEvent(bot, eventName, startDate, endDate, (err, calendar) => {
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
      if (!calendar || !calendar.timezone) {
        msg.channel.createMessage("Timezone not set. Run the `calendar <timezone>` command to set the timezone first.");
      }
      else {
        let now = moment();
        let resultString = "```css\n";

        if (calendar.events.length == 0) {
          resultString = resultString + "No events found!\n";
        }
        else {
          let i = 0;
          let activeEventHeaderWritten = false;
          while (i < calendar.events.length && now.diff(moment(calendar.events[i].startDate)) > 0) {
            if (!activeEventHeaderWritten) {
              resultString = resultString + "[Active Events]\n\n";
            }
            resultString = resultString + `${i+1} : ${calendar.events[i].name} /* ${moment(calendar.events[i].startDate).tz(calendar.timezone).toString()} to ${moment(calendar.events[i].endDate).tz(calendar.timezone).toString()} */\n`;
            i++;
          }
          if (i < calendar.events.length) {
            resultString = resultString + "\n[Upcoming Events]\n\n";
          }
          while (i < calendar.events.length) {
            resultString = resultString + `${i+1} : ${calendar.events[i].name} /* ${moment(calendar.events[i].startDate).tz(calendar.timezone).toString()} to ${moment(calendar.events[i].endDate).tz(calendar.timezone).toString()} */\n`;
            i++;
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
      if (!calendar) {
        msg.channel.createMessage("Calendar not found.");
      }
      else if (index < 0 || index >= calendar.events.length) {
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
    let now = moment();
    
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

    if (now.diff(startDate) > 0) {
      return "Cannot update to an event that starts in the past.";
    }

    Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        console.error(err);
        return;
      }
      if (!calendar) {
        msg.channel.createMessage("Calendar not found.");
      }
      else {
        if (index < 0 || index >= calendar.events.length) {
          msg.channel.createMessage("Event not found.");
        }
        else {
          let now = moment();
          if (now.diff(moment(calendar.events[index].startDate)) > 0) {
            msg.channel.createMessage("Cannot update an event that is currently active.");
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
      }
    });
  }, {
    description: "Update an existing event.",
    fullDescription: "Updates an existing event in the guild calendar.",
    usage: "`<event number> <event details>`"
  });
}