const misc = require('../modules/misc.module');
const cmdDesc = require('../assets/command-desc');

module.exports = (bot) => {
  bot.registerCommand("ping", (msg, args) => {
    misc.ping(bot, msg);
  }, cmdDesc.ping);

  bot.registerCommand("prefix", (msg, args) => {
    misc.prefix(bot, msg, args);
  }, cmdDesc.prefix);
}