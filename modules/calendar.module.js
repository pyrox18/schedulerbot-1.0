const chrono = require('chrono-node');
const moment = require('moment-timezone');
const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');

class CalendarModule {
  constructor() {

  }

  initCalendar(bot, msg, args) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      
      if (!calendar) {
        let newCal = new Calendar({
          _id: msg.channel.guild.id,
          timezone: args[0],
          prefix: config.prefix,
          defaultChannel: msg.channel.id
        });
        newCal.save((err, calendar) => {
          if (err) {
            new CommandError(err, bot, msg);
          }
          else {
            msg.channel.createMessage(`Set calendar timezone to ${calendar.timezone}.`);
          }
        });
      }
      else {
        if (calendar.timezone) {
          msg.channel.createMessage("The calendar timezone has already been set.");
        }
        else {
          calendar.timezone = args[0];
          calendar.defaultChannel = msg.channel.id;
          calendar.save(err => {
            if (err) {
              new CommandError(err, bot, msg);
            }
            else {
              msg.channel.createMessage(`Set calendar timezone to ${calendar.timezone}.`);
            }
          });
        }
      }
    });
  }

  addEvent(bot, msg, args) {
    let now = moment();
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else {
        if (calendar.checkPerm('event.create', msg)) {
          if (args.length < 1) {
            msg.channel.createMessage("Invalid input.");
            return;
          }
    
          let inputString = args.join(" ");
          let results = chrono.parse(inputString);
          if (!results[0]) {
            msg.channel.createMessage("Failed to parse event data.");
            return;
          }
    
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
            msg.channel.createMessage("Cannot create an event that starts in the past.");
          }
          else if (!calendar || !calendar.timezone) {
            msg.channel.createMessage("Timezone not set. Run the `calendar <timezone>` command to set the timezone first.");
          }
          else {
            calendar.addEvent(bot, eventName, startDate, endDate, (err, calendar) => {
              if (err) {
                new CommandError(err, bot, msg);
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
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
    });
  }

  listEvents(bot, msg, args) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else {
        if (calendar.checkPerm('event.list', msg)) {
          if (args.length > 0) {
            msg.channel.createMessage("Invalid input.");
          }
          else if (!calendar || !calendar.timezone) {
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
    
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
    });
  }

  deleteEvent(bot, msg, args) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else {
        if (calendar.checkPerm('event.delete', msg)) {
          if (args.length < 1 || args.length > 1) {
            msg.channel.createMessage("Invalid input.");
            return;
          }
    
          let index = parseInt(args[0]);
          if (isNaN(index)) {
            msg.channel.createMessage("Invalid input.");
            return;
          }
          index = index - 1;
    
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
                new CommandError(err, bot, msg);
              }
              else {
                let embed = bot.createEmbed(msg.channel.id);
                embed.title("Delete Event");
                embed.color(0xff2b2b);
                embed.field("Event Name", deletedEvent.name, false);
                embed.field("Start Date", moment(deletedEvent.startDate).tz(calendar.timezone).toString(), false);
                embed.field("End Date", moment(deletedEvent.endDate).tz(calendar.timezone).toString(), false);
    
                embed.send(bot, msg.channel.id);
                msg.channel.createMessage("Event deleted.");
              }
            });
          }
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
    });
  }

  updateEvent(bot, msg, args) {
    let now = moment();
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else {
        if (calendar.checkPerm('event.update', msg)) {
          if (args.length < 2) {
            msg.channel.createMessage("Invalid input.");
            return;
          }
    
          let index = parseInt(args[0]);
          if (isNaN(index)) {
            msg.channel.createMessage("Invalid input.");
            return;
          }
          index = index - 1;
    
          let inputString = args.slice(1).join(" ");
          let results = chrono.parse(inputString);
          if (!results[0]) {
            msg.channel.createMessage("Failed to parse event data.");
            return;
          }
    
    
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
            msg.channel.createMessage("Cannot update to an event that starts in the past.");
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
                    new CommandError(err, bot, msg);
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
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
    });
  }
}

module.exports = new CalendarModule();