const moment = require('moment-timezone');
const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');

class MiscModule {
  static ping(bot, msg) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else {
        let now = moment();
        if (calendar.checkPerm('ping', msg)) {
          let diff = now.diff(msg.timestamp);
          msg.channel.createMessage(`Pong! Time: ${diff}ms`);
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }    
    });
  }

  static prefix(bot, msg, args) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {      
      if (err) {
        new CommandError(err, bot, msg);
      }
      else if (args.length > 1) {
        msg.channel.createMessage("Invalid input.");
      }
      else if (args.length == 0) {
        if (calendar.checkPerm('prefix.show', msg)) {
          msg.channel.createMessage("`" + calendar.prefix + "`");
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
      else {
        if (calendar.checkPerm('prefix.modify', msg)) {
          calendar.updatePrefix(args[0], err => {
            if (err) {
              new CommandError(err, bot, msg);
            }
            else {
              let prefixes = [args[0], bot.user.mention + " "];
              bot.registerGuildPrefix(msg.channel.guild.id, prefixes);
              msg.channel.createMessage("Prefix set to `" + args[0] + "`.");
            }
          });
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
    });
  }
}

module.exports = MiscModule;