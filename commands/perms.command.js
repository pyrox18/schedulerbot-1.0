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
  let permsCommand = bot.registerCommand('perms', (msg, args) => {
    if (args.length < 4 || (args[0] != 'allow' && args[0] != 'deny') || (args[2] != '--role' && args[2] != '--user')) {
      return "Invalid input.";
    }
    if (!availableNodes.find(node => { return args[1] == node })) {
      return "Invalid input.";
    }

    let targetName = args.slice(3).join(' ');
    let results;
    if (args[2] == '--role') {
      results = findEntityNames(msg.channel.guild.roles, targetName);
    }
    else {
      results = findEntityNames(msg.channel.guild.members, targetName);
    }
    if (results.length == 0) {
      return "No match found.";
    }
    if (results.length > 1) {
      let resultString = "```css\n";
      for (let i = 0; i < results.length; i++) {
        resultString = resultString + `${i+1} : ${results[i][1]}\n`
      }
      resultString = resultString + "```";

      msg.channel.createMessage("Select one.\n" + resultString);
      setTimeout(() => {
        bot.once('messageCreate', msg => {
          let index = parseInt(msg.content);
          if (isNaN(index)) {
            return;
          }
          index = index - 1;
          if (args[2] == '--role') {
            setRolePermission(args[1], results[index][1], args[0], msg);  
          }
          else {
            setUserPermission(args[1], results[index][1], args[0], msg);
          }
        }); 
      }, 1000);
    }
    else {
      if (args[2] == '--role') {
        setRolePermission(args[1], results[0][1], args[0], msg);  
      }
      else {
        setUserPermission(args[1], results[0][1], args[0], msg);
      }
    }
  }, {
    description: "Set role/user-specific command permissions.",
    fullDescription: "Allow or deny specific users/roles from the usage of certain commands.",
    usage: "`<allow|deny> <node> [--role <role>] [--user <user>]`"
  });

  permsCommand.registerSubcommand('nodes', (msg, args) => {
    let nodes = "```css\n";
    for (let node of availableNodes) {
      nodes = nodes + `${node}\n`;
    }
    nodes = nodes + "```";
    return nodes;
  }, {
    description: "Display available nodes.",
    fullDescription: "Display a list of available permission nodes."
  });
}

setRolePermission = function(node, roleName, perm, msg) {
  let roleId = msg.channel.guild.roles.find(role => {
    if (role.name == roleName) {
      return role.id;
    }
  }).id;

  Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
    if (err) {
      new CommandError(err, bot, msg);
    }
    else {
      if (perm == 'deny') {
        calendar.denyRolePerm(roleId, node, err => {
          if (err) {
            new CommandError(err, bot, msg);
          }
          else {
            msg.channel.createMessage('Permission successfully modified.');
          }
        });
      }
      else {
        calendar.allowRolePerm(roleId, node, err => {
          if (err) {
            new CommandError(err, bot, msg);
          }
          else {
            msg.channel.createMessage('Permission successfully modified.');
          }
        });
      }
    }
  })
}

setUserPermission = function(node, username, perm, msg) {
  let userId = msg.channel.guild.members.find(member => {
    let fullName = `${member.username}#${member.discriminator}`;
    if (member.nick) {
      fullName = fullName + ` (${member.nick})`;
    }
    if (fullName == username) {
      return member;
    }
  }).id;

  Calendar.findByGuildId(msg.channel.guild.id, (err, calendar) => {
    if (err) {
      new CommandError(err, bot, msg);
    }
    else {
      if (perm == 'deny') {
        calendar.denyUserPerm(userId, node, err => {
          if (err) {
            new CommandError(err, bot, msg);
          }
          else {
            msg.channel.createMessage('Permission successfully modified.');
          }
        });
      }
      else {
        calendar.allowUserPerm(userId, node, err => {
          if (err) {
            new CommandError(err, bot, msg);
          }
          else {
            msg.channel.createMessage('Permission successfully modified.');
          }
        });
      }
    }
  })
}

findEntityNames = function(entityCollection, targetName) {
  let names = [];
  entityCollection.forEach(value => {
    if (value.name) { // only role collections have a name property
      names.push(value.name);
    }
    else {
      let result = `${value.username}#${value.discriminator}`;
      if (value.nick) {
        result = result + ` (${value.nick})`;
      }
      names.push(result);
    }
  });
  let fuzzyNames = FuzzySet(names);
  return fuzzyNames.get(targetName, null, 0.1);
}