const moment = require('moment-timezone');
const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');
const version = require('../package.json').version;

class MiscModule {
  static ping(msg, callback) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        callback(err);
      }
      else {
        try {
          let now = moment();
          if (calendar.checkPerm('ping', msg)) {
            let diff = now.diff(moment(msg.timestamp));
            callback(null, diff);
          }
          else {
            callback(null, null);
          }
        }
        catch (e) {
          callback(e);
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

  static info(bot, msg) {
    let uptimeParsed = convertMS(bot.uptime);
    let output = "```\n";
    output += "SchedulerBot\n\n";
    output += "Version: " + version + "\n";
    output += `Guilds serving: ${bot.guilds.size}\n`;
    output += `Users serving: ${bot.users.size}\n`;
    output += `Uptime: ${uptimeParsed.d} days, ${uptimeParsed.h} hours, ${uptimeParsed.m} minutes, ${uptimeParsed.s} seconds\n`;
    output += "```"
    msg.channel.createMessage(output);
  }
}

function convertMS(ms) { // https://gist.github.com/remino/1563878
  var d, h, m, s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;
  d = Math.floor(h / 24);
  h = h % 24;
  return { d: d, h: h, m: m, s: s };
};

module.exports = MiscModule;