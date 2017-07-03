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
        let resultString = "```css\n";
        for (let i = 0; i < results.length; i++) {
          resultString = resultString + `${i+1} : ${results[i][1]}\n`
        }
        resultString = resultString + "```";

        msg.channel.createMessage("Select a role.\n" + resultString);
        setTimeout(() => {
          bot.once('messageCreate', msg => {
            let index = parseInt(msg.content);
            if (isNaN(index)) {
              return;
            }
            index = index - 1;
            matchedRoleName = results[index][1];
            setPermission(args[1], matchedRoleName, args[0], msg);
          }); 
        }, 1000);
        
        return;
      }
      else {
        matchedRoleName = results[0][1];
        setPermission(args[1], matchedRoleName, args[0], msg);
      }
    }
  }, {
    description: "Set role/user-specific command permissions.",
    fullDescription: "Allow or deny specific users/roles from the usage of certain commands.",
    usage: "`<allow|deny> <node> [--role <role>] [--user <user>]`"
  });
}

setPermission = function(node, entityName, perm, msg) {
  let roleId = msg.channel.guild.roles.find(role => {
    if (role.name == entityName) {
      return role.id;
    }
  }).id;

  Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
    if (err) {
      new CommandError(err, bot, msg);
    }
    else {
      calendar.modifyPerm(node, 'role', roleId, perm, err => {
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