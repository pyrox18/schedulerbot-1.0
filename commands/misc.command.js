const moment = require('moment-timezone');

const config = require('../config/bot.config');
const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');

module.exports = (bot) => {
  bot.registerCommand("ping", (msg, args) => {
    let diff = moment().diff(msg.timestamp);
    return `Pong! Time: ${diff}ms`;
  }, {
    description: "Ping the bot.",
    fullDescription: "Pings the bot to check if the bot is available."
  });

  bot.registerCommand("prefix", (msg, args) => {
    if (args.length == 0) {
      Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
        if (err) {
          new CommandError(err, bot, msg);
        }
        else {
          msg.channel.createMessage("`" + calendar.prefix + "`");
        }
      });
    }
    else if (args.length > 1) {
      msg.channel.createMessage("Invalid input.");
    }
    else {
      Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
        if (err) {
          new CommandError(err, bot, msg);
        }
        else {
          calendar.updatePrefix(args[0], err => {
            if (err) {
              new CommandError(err, bot, msg);
            }
            else {
              prefixes = [args[0], bot.user.mention + " "];
              bot.registerGuildPrefix(msg.channel.guild.id, prefixes);
              msg.channel.createMessage("Prefix set to `" + args[0] + "`.");
            }
          });
        }
      });
    }
  }, {
    description: "Show or set prefix.",
    fullDescription: "Shows the bot's current prefix when called without arguments. To set a new prefix for the guild, call the command with the desired prefix after the command. You can also call the command by mentioning the bot (`@SchedulerBot prefix`) if you forget what the prefix is.",
    usage: "[new prefix]"
  });
}