const FuzzySet = require('fuzzyset.js');

const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');

const availableNodes = [
  'calendar',
  'event.create',
  'event.update',
  'event.delete',
  'event.list',
  'ping',
  'prefix'
];

module.exports = (bot) => {
  bot.registerCommand('perms', (msg, args) => {
    if (args.length < 4 || (args[0] != 'allow' && args[0] != 'deny') || (args[2] != '--role' && args[2] != '--user')) {
      return "Invalid input.";
    }
    if (!availableNodes.find(node => { return args[1] == node })) {
      return "Invalid input.";
    }

    if (args[2] == '--role') {
      let fuzzyRoleName = args.slice(3).join(' ');
      let roles = [];
      msg.channel.guild.roles.forEach(value => {
        roles.push(value.name);
      });
      console.log(roles);
      console.log(typeof roles);
      let fuzzyRoles = FuzzySet(roles);
      let results = fuzzyRoles.get(fuzzyRoleName);
      if (results.length == 0) {
        return "No matching role found.";
      }

      let matchedRoleName;
      if (results.length > 1) {
        // Temporary; replace with selector later
        return "Too many roles matching the name. Please be more specific.";
      }
      else {
        matchedRoleName = results[0][1];
      }

      let roleId = msg.channel.guild.roles.find(role => {
        if (role.name == matchedRoleName) {
          return role.id;
        }
      }).id;

      Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
        if (err) {
          new CommandError(err, bot, msg);
        }
        else {
          calendar.modifyPerm(args[1], 'role', roleId, args[0], err => {
            if (err) {
              new CommandError(err, bot, msg);
            }
            else {
              msg.channel.createMessage('Permission successfully modified.');
            }
          });
        }
      })
    }
  }, {
    description: "Set role/user-specific command permissions.",
    fullDescription: "Allow or deny specific users/roles from the usage of certain commands.",
    usage: "`<allow|deny> <node> [--role <role>] [--user <user>]`"
  });
}