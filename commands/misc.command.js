const misc = require('../modules/misc.module');

module.exports = (bot) => {
  bot.registerCommand("ping", (msg, args) => {
    misc.ping(bot, msg);
  }, {
    description: "Ping the bot.",
    fullDescription: "Pings the bot to check if the bot is available."
  });

  bot.registerCommand("prefix", (msg, args) => {
    misc.prefix(bot, msg, args);
  }, {
    description: "Show or set prefix.",
    fullDescription: "Shows the bot's current prefix when called without arguments. To set a new prefix for the guild, call the command with the desired prefix after the command. You can also call the command by mentioning the bot (`@SchedulerBot prefix`) if you forget what the prefix is.",
    usage: "[new prefix]"
  });
}