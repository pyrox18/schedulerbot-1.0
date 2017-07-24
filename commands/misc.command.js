const CommandError = require('../models/command-error.model');
const misc = require('../modules/misc.module');
const cmdOptions = require('../assets/command-options');

module.exports = (bot) => {
  bot.registerCommand("ping", (msg, args) => {
    try {
      misc.ping(bot, msg);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdOptions.ping);

  bot.registerCommand("prefix", (msg, args) => {
    try {
      misc.prefix(bot, msg, args);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdOptions.prefix);
}