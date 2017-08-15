const CommandError = require('../models/command-error.model');
const calendar = require('../modules/calendar.module');
const config = require('../config/bot.config');
const commandOptions = require('../assets/command-options');
require('eris-embed-builder');

module.exports = (bot) => {
  let eventCommand = bot.registerCommand("event", (msg, args) => {
    calendar.addEvent(bot, msg, args, res => {
      if (res.error()) {
        return new CommandError(res.message, bot, msg);
      }
      if (res.unauthorized()) {
        return msg.channel.createMessage("You are not permitted to use this command.");
      }
      if (res.invalid()) {
        if (res.meta.parseFail) {
          return msg.channel.createMessage("Failed to parse event data.");
        }
        if (res.meta.eventInPast) {
          return msg.channel.createMessage("Cannot create an event that starts in the past.");
        }
        if (res.meta.noTimezone) {
          return msg.channel.createMessage("Timezone not set. Run the `init <timezone>` command to set the timezone first.");
        }
        if (res.meta.argCount) {
          return msg.channel.createMessage("Usage: `event <event details>` Example: `event CSGO Scrims 7pm-9pm tomorrow`");
        }
      }
      if (res.success()) {
        res.meta.eventEmbed.send(bot, msg.channel.id);
        return msg.channel.createMessage("New event created.");
      }
    });
  }, commandOptions.event.add);

  eventCommand.registerSubcommand("list", (msg, args) => {
    calendar.listEvents(msg, res => {
      if (res.error()) {
        return new CommandError(res.message, bot, msg);
      }
      if (res.invalid()) {
        return msg.channel.createMessage("Timezone not set. Run the `init <timezone>` command to set the timezone first.");
      }
      if (res.unauthorized()) {
        msg.channel.createMessage("You are not permitted to use this command.");
      }
      if (res.success()) {
        msg.channel.createMessage(res.meta.events);
      }
    })
  }, commandOptions.event.list);

  eventCommand.registerSubcommand("delete", (msg, args) => {
    calendar.deleteEvent(msg, args, res => {
      if (res.error()) {
        return new CommandError(res.message, bot, msg);
      }
      if (res.invalid()) {
        if (res.meta.argCount || res.meta.indexNaN) {
          return msg.channel.createMessage("Usage: `event delete <eventIndex>` (eventIndex can be checked by running `event list`)");
        }
        if (res.meta.noCalendar) {
          return msg.channel.createMessage("Calendar not found. Run `init <timezone>` to initialise the guild calendar.");
        }
        if (res.meta.noEvent) {
          return msg.channel.createMessage("Event not found.");
        }
      }
      if (res.unauthorized()) {
        return msg.channel.createMessage("You are not permitted to use this command.");
      }
      if (res.success()) {
        res.meta.eventEmbed.send(bot, msg.channel.id);
        return msg.channel.createMessage("Event deleted.");
      }
    });
  }, commandOptions.event.delete);

  eventCommand.registerSubcommand("update", (msg, args) => {
    calendar.updateEvent(bot, msg, args, res => {
      if (res.error()) {
        return new CommandError(res.message, bot, msg);
      }
      if (res.invalid()) {
        if (res.meta.argCount || res.meta.indexNaN) {
          return msg.channel.createMessage("Usage: `event delete <eventIndex>` (eventIndex can be checked by running `event list`)");
        }
        if (res.meta.noCalendar) {
          return msg.channel.createMessage("Calendar not found. Run `init <timezone>` to initialise the guild calendar.");
        }
        if (res.meta.noEvent) {
          return msg.channel.createMessage("Event not found.");
        }
        if (res.meta.parseFail) {
          return msg.channel.createMessage("Failed to parse event data.");
        }
        if (res.meta.eventInPast) {
          return msg.channel.createMessage("Cannot update to an event that starts in the past.");
        }
      }
      if (res.unauthorized()) {
        return msg.channel.createMessage("You are not permitted to use this command.");
      }
      if (res.success()) {
        res.meta.eventEmbed.send(bot, msg.channel.id);
        return msg.channel.createMessage("Event updated.");
      }
    });
  }, commandOptions.event.update);
}