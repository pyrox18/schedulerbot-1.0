const moment = require('moment-timezone');

const config = require('../config/bot');

let prefix = config.prefix;

module.exports = (bot) => {
  bot.registerCommand("ping", (msg, args) => {
    let diff = moment().diff(msg.timestamp);
    return `Pong! Time: ${diff}ms`;
  }, {
    description: "Ping the bot.",
    fullDescription: "Pings the bot to check if the bot is available."
  });

  bot.registerCommand("prefix", "`" + prefix + "`", {
    description: "Show prefix.",
    fullDescription: "Shows the bot's current prefix.",
    usage: "(or `@SchedulerBot prefix` if you forgot what the prefix is)"
  });
}