const moment = require('moment-timezone');
const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');
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
        callback(Response.invalid());
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
}

module.exports = MiscModule;