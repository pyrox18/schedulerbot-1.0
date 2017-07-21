const CommandError = require('../models/command-error.model');
const misc = require('../modules/misc.module');
const cmdDesc = require('../assets/command-desc');

module.exports = (bot) => {
  bot.registerCommand("ping", (msg, args) => {
    try {
      misc.ping(bot, msg);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdDesc.ping);

  bot.registerCommand("prefix", (msg, args) => {
    try {
      misc.prefix(bot, msg, args);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdDesc.prefix);
}