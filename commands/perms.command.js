const perms = require('../modules/perms.module');

module.exports = (bot) => {
  let permsCommand = bot.registerCommand('perms', (msg, args) => {
    if (args.length < 4 || (args[0] != 'allow' && args[0] != 'deny') || (args[2] != '--role' && args[2] != '--user')) {
      return "Invalid input.";
    }

    perms.modifyPerms(bot, msg, args);
  }, {
    description: "Set role/user-specific command permissions.",
    fullDescription: "Allow or deny specific users/roles from the usage of certain commands.",
    usage: "`<allow|deny> <node> [--role <role>] [--user <user>]`"
  });

  permsCommand.registerSubcommand('nodes', (msg, args) => {
    perms.displayPermNodes(bot, msg);
  }, {
    description: "Display available nodes.",
    fullDescription: "Display a list of available permission nodes."
  });

  permsCommand.registerSubcommand('show', (msg, args) => {
    if (args.length < 2 || (args[0] != '--node' && args[0] != '--role' && args[0] != '--user')) {
      return "Invalid input.";
    }
    
    perms.showPerm(bot, msg, args);
  }, {
    description: "Show the permissions related to a node, user or role.",
    fullDescription: "Display the permission settings granted in relation to a node, or to a role or user.",
    usage: '`--node <node>|--role <role>|--user <user>`'
  })
}