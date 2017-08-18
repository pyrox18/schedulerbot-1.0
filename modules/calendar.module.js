const chrono = require('chrono-node');
const moment = require('moment-timezone');
require('eris-embed-builder');

const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');
const Response = require('../models/response.model');
const config = require('../config/bot.config');

class CalendarModule {
  static initCalendar(msg, args, callback) {
    try {
      Calendar.findById(msg.channel.guild.id, (err, calendar) => {
        if (err) {
          callback(Response.dbError("Guild calendar lookup error", { error: err }));
        }
        else if (args.length > 1 || args.length < 1 || moment.tz.zone(args[0]) === null) {
          callback(Response.reject());
        } 
        else if (!calendar) {
          let newCal = new Calendar({
            _id: msg.channel.guild.id,
            timezone: args[0],
            prefix: config.prefix,
            defaultChannel: msg.channel.id
          });
          newCal.save((err, calendar) => {
            if (err) {
              callback(Response.dbError("New guild calendar save error", { error: err }));
            }
            else {
              callback(Response.success({ timezone: calendar.timezone }));
            }
          });
        }
        else {
          if (calendar.timezone) {
            callback(Response.success({ alreadyInit: true }));
          }
          else {
            calendar.timezone = args[0];
            calendar.defaultChannel = msg.channel.id;
            calendar.save(err => {
              if (err) {
                callback(Response.dbError("Guild calendar timezone save error", { error: err }));
              }
              else {
                callback(Response.success({ timezone: calendar.timezone }));
              }
            });
          }
        }
      });
    }
    catch (e) {
      callback(Response.error("Method execution error", { error: e }));
    }
  }

  static addEvent(bot, msg, args, callback) {
    try {
      let now = moment();
      if (args.length < 1) {
        return callback(Response.reject({ argCount: true }));
      }
  
      Calendar.findById(msg.channel.guild.id, (err, calendar) => {
        if (err) {
          callback(Response.dbError("Guild calendar lookup error", { error: err }));
        }
        else if (!calendar || !calendar.timezone) {
          callback(Response.reject({ noTimezone: true }));
        }
        else {
          if (calendar.checkPerm('event.create', msg)) {
            let inputString = args.join(" ");
            let results = chrono.parse(inputString);
            if (!results[0]) {
              return callback(Response.reject({ parseFail: true }));
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
              callback(Response.reject({ eventInPast: true }));
            }
            else {
              calendar.addEvent(bot, eventName, startDate, endDate, (err, calendar) => {
                if (err) {
                  callback(Response.error("Calendar add event save failure", { error: err }));
                }
                else {
                  let embed = bot.createEmbed(msg.channel.id);
                  embed.title("New Event");
                  embed.color(0x7caeff);
                  embed.field("Event Name", eventName, false);
                  embed.field("Start Date", moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, calendar.timezone).toString(), false);
                  embed.field("End Date", moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, calendar.timezone).toString(), false);
  
                  callback(Response.success({ eventEmbed: embed }));
                }
              });
            }
          }
          else {
            callback(Response.unauthorized());
          }
        }
      });
    }
    catch (e) {
      callback(Response.error("Method execution error", { error: e }));
    }
  }

  static listEvents(msg, callback) {
    try {
      Calendar.findById(msg.channel.guild.id, (err, calendar) => {
        if (err) {
          callback(Response.dbError("Guild calendar lookup error"));
        }
        else if (!calendar || !calendar.timezone) {
          callback(Response.reject({ noTimezone: true }));
        }
        else {
          if (calendar.checkPerm('event.list', msg)) {
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
            callback(Response.success({ events: resultString }));
          }
          else {
            callback(Response.unauthorized);
          }
        }
      });
    }
    catch (e) {
      callback(Response.error("Method execution error", { error: e }));
    }
  }

  static deleteEvent(msg, args, callback) {
    try {
      if (args.length < 1 || args.length > 1) {
        return callback(Response.reject({ argCount: true }));
      }

      let index = parseInt(args[0]);
      if (isNaN(index)) {
        return callback(Response.reject({ indexNaN: true }));
      }

      Calendar.findById(msg.channel.guild.id, (err, calendar) => {
        if (err) {
          callback(Response.dbError("Guild calendar lookup error", { error: err }));
        }
        else if (!calendar) {
          callback(Response.reject({ noCalendar: true }));
        }
        else {
          if (calendar.checkPerm('event.delete', msg)) {
            index = index - 1;
            if (index < 0 || index >= calendar.events.length) {
              callback(Response.reject({ noEvent: true }));
            }
            else {
              let deletedEvent = calendar.events[index];
              calendar.deleteEvent(index, (err) => {
                if (err) {
                  callback(Response.dbError("Calendar delete event save failure", { error: err }));
                }
                else {
                  let embed = bot.createEmbed(msg.channel.id);
                  embed.title("Delete Event");
                  embed.color(0xff2b2b);
                  embed.field("Event Name", deletedEvent.name, false);
                  embed.field("Start Date", moment(deletedEvent.startDate).tz(calendar.timezone).toString(), false);
                  embed.field("End Date", moment(deletedEvent.endDate).tz(calendar.timezone).toString(), false);
      
                  callback(Response.success({ eventEmbed: embed }));
                }
              });
            }
          }
          else {
            callback(Response.unauthorized());
          }
        }
      });
    }
    catch (e) {
      callback(Response.error("Method execution error", { error: e }));
    }
  }

  static updateEvent(bot, msg, args, callback) {
    try {
      let now = moment();
      if (args.length < 2) {
        return callback(Response.reject({ argCount: true }));
      }
      let index = parseInt(args[0]);
      if (isNaN(index)) {
        return callback(Response.reject({ indexNaN: true }));
      }

      Calendar.findById(msg.channel.guild.id, (err, calendar) => {
        if (err) {
          callback(Response.dbError("Guild calendar lookup error", { error: err }));
        }
        else if (!calendar) {
          return callback(Response.reject({ noCalendar: true }));
        }
        else {
          if (calendar.checkPerm('event.update', msg)) {
            index = index - 1;
            let inputString = args.slice(1).join(" ");
      
            let results = chrono.parse(inputString);
            if (!results[0]) {
              return callback(Response.reject({ parseFail: true }));
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
              return callback(Response.reject({ eventInPast: true }));
            }
            else {
              if (index < 0 || index >= calendar.events.length) {
                callback(Response.reject({ noEvent: true }));
              }
              else {
                let now = moment();
                if (now.diff(moment(calendar.events[index].startDate)) > 0) {
                  msg.channel.createMessage("Cannot update an event that is currently active.");
                }
                else {
                  calendar.updateEvent(index, eventName, startDate, endDate, (err, calendar) => {
                    if (err) {
                      callback(Response.dbError("Calendar update event save failure", { error: err }));
                    }
                    else {
                      let embed = bot.createEmbed(msg.channel.id);
                      embed.title("Update Event");
                      embed.color(0xfff835);
                      embed.field("Event Name", eventName, false);
                      embed.field("Start Date", moment.tz(startDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, calendar.timezone).toString(), false);
                      embed.field("End Date", moment.tz(endDate.format('YYYY-MM-DDTHH:mm:ss.SSS'), moment.ISO_8601, calendar.timezone).toString(), false);
      
                      callback(Response.success({ eventEmbed: embed }));
                    }
                  });
                }
              }
            }
          }
          else {
            callback(Response.unauthorized());
          }
        }
      });
    }
    catch (e) {
      callback(Response.error("Method execution error", { error: e }));
    }
  }
}

module.exports = CalendarModule;
