const moment = require('moment-timezone');
const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');
const version = require('../package.json').version;
const Response = require('../models/response.model');

class MiscModule {
  static ping(msg, callback) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        callback(Response.error("Guild calendar find error", { error: err }));
      }
      else {
        try {
          let now = moment();
          if (calendar.checkPerm('ping', msg)) {
            let diff = now.diff(moment(msg.timestamp));
            callback(Response.success({
              ping: diff
            }));
          }
          else {
            callback(Response.unauthorized());
          }
        }
        catch (e) {
          callback(Response.error("Method execution error", { error: e }));
        }
      }    
    });
  }

  static prefix(msg, args, callback) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        callback(Response.dbError("Guild calendar find error", { error: err }));
      }
      else if (args.length > 1) {
        callback(Response.reject());
      }
      else if (args.length == 0) {
        try {
          if (calendar.checkPerm('prefix.show', msg)) {
            callback(Response.success({ prefix: calendar.prefix }));
          }
          else {
            callback(Response.unauthorized());
          }
        }
        catch (e) {
          callback(Response.error("Method execution error", { error: e }));
        }
      }
      else {
        if (calendar.checkPerm('prefix.modify', msg)) {
          calendar.updatePrefix(args[0], err => {
            if (err) {
              callback(Response.dbError("Prefix update error", { error: err }));
            }
            else {
              try {
                let prefixes = [args[0], bot.user.mention + " "];
                bot.registerGuildPrefix(msg.channel.guild.id, prefixes);
                callback(Response.success({ 
                  isModified: true,
                  newPrefix: args[0]
                }));
              }
              catch (e) {
                callback(Response.error("Method execution error", { error: e }));
              }
            }
          });
        }
        else {
          callback(Response.unauthorized());
        }
      }
    });
  }

  static info(bot, msg, callback) {
    try {
      let uptimeParsed = convertMS(bot.uptime);
      let output = "```\n";
      output += "SchedulerBot\n\n";
      output += "Version: " + version + "\n";
      output += `Guilds serving: ${bot.guilds.size}\n`;
      output += `Users serving: ${bot.users.size}\n`;
      output += `Uptime: ${uptimeParsed.d} day(s), ${uptimeParsed.h} hour(s), ${uptimeParsed.m} minute(s), ${uptimeParsed.s} second(s)\n`;
      output += "```"
      callback(Response.success({ output: output }));
    }
    catch (e) {
      callback(Response.error("Method execution error", { error: e }));
    }
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