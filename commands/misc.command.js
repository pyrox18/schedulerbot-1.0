const CommandError = require('../models/command-error.model');
const misc = require('../modules/misc.module');
const cmdOptions = require('../assets/command-options');

module.exports = (bot) => {
  bot.registerCommand("ping", (msg, args) => {
    misc.ping(msg, (err, res) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else if (!res) {
        msg.channel.createMessage("You are not permitted to use this command.");
      }
      else {
        msg.channel.createMessage(`Pong! Time: ${res}ms`);
      }
    });
  }, cmdOptions.ping);

  bot.registerCommand("prefix", (msg, args) => {
    try {
      misc.prefix(bot, msg, args);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdOptions.prefix);

  bot.registerCommand("support", `Click the following link to join the bot's support server. https://discord.gg/CRxRn5X`, cmdOptions.support);

  bot.registerCommand("invite", `Click the following link to invite the bot to your server. https://discordapp.com/oauth2/authorize?client_id=339019867325726722&scope=bot&permissions=150536`, cmdOptions.invite);
}