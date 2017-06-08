const config = require('../config/bot');

let prefix = config.prefix;

module.exports = (bot) => {
  bot.registerCommand("ping", "Pong!", {
    description: "Pong!",
    fullDescription: "Checks to see if the bot is alive."
  });

  bot.registerCommand("prefix", "`" + prefix + "`", {
    description: "Show prefix.",
    fullDescription: "Shows the bot's current prefix."
  });
}