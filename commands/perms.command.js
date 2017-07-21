const CommandError = require('../models/command-error.model');
const perms = require('../modules/perms.module');
const cmdDesc = require('../assets/command-desc');

module.exports = (bot) => {
  let permsCommand = bot.registerCommand('perms', (msg, args) => {
    if (args.length < 4 || (args[0] != 'allow' && args[0] != 'deny') || (args[2] != '--role' && args[2] != '--user')) {
      return "Invalid input.";
    }

    try {
      perms.modifyPerms(bot, msg, args);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdDesc.perms.modify);

  permsCommand.registerSubcommand('nodes', (msg, args) => {
    try {
      perms.displayPermNodes(bot, msg);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdDesc.perms.nodes);

  permsCommand.registerSubcommand('show', (msg, args) => {
    if (args.length < 2 || (args[0] != '--node' && args[0] != '--role' && args[0] != '--user')) {
      return "Invalid input.";
    }
    
    try {
      perms.showPerm(bot, msg, args);
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdDesc.perms.show);
}