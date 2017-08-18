const CommandError = require('../models/command-error.model');
const perms = require('../modules/perms.module');
const cmdOptions = require('../assets/command-options');

module.exports = (bot) => {
  let permsCommand = bot.registerCommand('perms', (msg, args) => {
    perms.modifyPerms(bot, msg, args, res => {
      if (res.error()) {
        return new CommandError(res.message, bot, msg);
      }
      if (res.invalid()) {
        if (res.meta.invalidArgs) {
          return msg.channel.createMessage("Usage: `perms <allow|deny> <permNode> < --role <role> | --user <user> >`\nRun `perms nodes` for a list of available nodes.");
        }
        if (res.meta.noCalendar) {
          return msg.channel.createMessage("Calendar not found. Run `init <timezone>` to initialise the guild calendar.");
        }
        if (res.meta.noNode) {
          return msg.channel.createMessage("Node not found.");
        }
        if (res.meta.noRoleOrUser) {
          return msg.channel.createMessage("No matching role/user found.");
        }
      }
      if (res.unauthorized()) {
        return msg.channel.createMessage("You are not permitted to use this command.");
      }
      if (res.success()) {
        return msg.channel.createMessage("Permission successfully modified.");
      }
    });
  }, cmdOptions.perms.modify);

  permsCommand.registerSubcommand('nodes', (msg, args) => {
    perms.displayPermNodes(bot, msg, res => {
      if (res.error()) {
        return new CommandError(res.message, bot, msg);
      }
      if (res.invalid()) {
        return msg.channel.createMessage("Calendar not found. Run `init <timezone>` to initialise the guild calendar.");
      }
      if (res.unauthorized()) {
        return msg.channel.createMessage("You are not permitted to use this command.");
      }
      if (res.success()) {
        return msg.channel.createMessage(res.meta.nodes);
      }
    });
  }, cmdOptions.perms.nodes);

  permsCommand.registerSubcommand('show', (msg, args) => {
    perms.showPerm(bot, msg, args, res => {
      if (res.error()) {
        return new CommandError(res.message, bot, msg);
      }
      if (res.invalid()) {
        if (res.meta.invalidArgs) {
          return msg.channel.createMessage("Usage: `perms show < --node <permNode> | --role <role> | --user <user> >`");
        }
        if (res.meta.noCalendar) {
          return msg.channel.createMessage("Calendar not found. Run `init <timezone>` to initialise the guild calendar.");
        }
        if (res.meta.noNode) {
          return msg.channel.createMessage("The node does not exist.");
        }
        if (res.meta.noRoleOrUser) {
          return msg.channel.createMessage("No match found.");
        }
      }
      if (res.unauthorized()) {
        return msg.channel.createMessage("You are not permitted to use this command.");
      }
      if (res.success()) {
        return msg.channel.createMessage(res.meta.result);
      }
    });
  }, cmdOptions.perms.show);
}