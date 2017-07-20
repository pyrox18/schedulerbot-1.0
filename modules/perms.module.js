const FuzzySet = require('fuzzyset.js');

const Calendar = require('../models/calendar.model');
const CommandError = require('../models/command-error.model');

const availableNodes = [
  // 'calendar',
  'event.create',
  'event.update',
  'event.delete',
  'event.list',
  'ping',
  'prefix',
  'perms.modify',
  'perms.nodes',
  'perms.show'
];

class PermsModule {
  static modifyPerms(bot, msg, args) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else {
        if (calendar.checkPerm('perms.modify', msg)) {
          if (!availableNodes.find(node => { return args[1] == node })) {
            msg.channel.createMessage("Node not found.");
            return;
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
            msg.channel.createMessage("No matching role/user found.");
            return;
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
                  setRolePermission(bot, calendar, args[1], results[index][1], args[0], msg);  
                }
                else {
                  setUserPermission(bot, calendar, args[1], results[index][1], args[0], msg);
                }
              }); 
            }, 1000);
          }
          else {
            if (args[2] == '--role') {
              setRolePermission(bot, calendar, args[1], results[0][1], args[0], msg);  
            }
            else {
              setUserPermission(bot, calendar, args[1], results[0][1], args[0], msg);
            }
          }
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
    });
  }
  
  static displayPermNodes(bot, msg) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else {
        if (calendar.checkPerm('perms.nodes', msg)) {
          let nodes = "```css\n";
          for (let node of availableNodes) {
            nodes = nodes + `${node}\n`;
          }
          nodes = nodes + "```";
          msg.channel.createMessage(nodes);
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
    });
  }
  
  static showPerm(bot, msg, args) {
    Calendar.findById(msg.channel.guild.id, (err, calendar) => {
      if (err) {
        new CommandError(err, bot, msg);
      }
      else {
        if (calendar.checkPerm('perms.show', msg)) {
          if (args[0] == '--node') {
            if (availableNodes.find(node => { return node == args[1] })) {
              let permNode = calendar.permissions.find(perm => {
                return perm.node == args[1];
              });
              
              let resultString = "```css\nNode: " + args[1] + "\nDenied Roles: ";
              if (!permNode || permNode.deniedRoles.length == 0) {
                resultString = resultString + "None";
              }
              else {
                for (let i = 0; i < permNode.deniedRoles.length; i++) {
                  resultString = resultString + msg.channel.guild.roles.get(permNode.deniedRoles[i]).name;
                  if (i < permNode.deniedRoles.length - 1) {
                    resultString = resultString + ", ";
                  }
                }
              }
              resultString = resultString + "\nDenied Users: ";
              if (!permNode || permNode.deniedUsers.length == 0) {
                resultString = resultString + "None";
              }
              else {
                for (let i = 0; i < permNode.deniedUsers.length; i++) {
                  let user = msg.channel.guild.members.get(permNode.deniedUsers[i]);
                  resultString = resultString + `${user.username}#${user.discriminator}`
                  if (user.nick) {
                    resultString = resultString + ` (${user.nick})`;
                  }
                  if (i < permNode.deniedUsers.length - 1) {
                    resultString = resultString + ", ";
                  }
                }
              }
              resultString = resultString + "\n```";
    
              msg.channel.createMessage(resultString);
            }
            else {
              return "The node does not exist.";
            }
          }
          else {
            let targetName = args.slice(1).join(' ');
            let results;
            if (args[0] == '--role') {
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
                  if (args[0] == '--role') {
                    displayRolePermissions(bot, calendar, msg, results[index][1]);
                  }
                  else {
                    displayUserPermissions(bot, calendar, msg, results[index][1]);
                  }
                }); 
              }, 1000);
            }
            else {
              if (args[0] == '--role') {
                displayRolePermissions(bot, calendar, msg, results[0][1]);  
              }
              else {
                displayUserPermissions(bot, calendar, msg, results[0][1]);  
              }
            }
          }
        }
        else {
          msg.channel.createMessage("You are not permitted to use this command.");
        }
      }
    });
  }
}

getRoleIdByName = function(roleCollection, roleName) {
  return roleCollection.find(role => {
    if (role.name == roleName) {
      return role;
    }
  }).id;
}

getUserIdByName = function(userCollection, username) {
  return userCollection.find(member => {
    let fullName = `${member.username}#${member.discriminator}`;
    if (member.nick) {
      fullName = fullName + ` (${member.nick})`;
    }
    if (fullName == username) {
      return member;
    }
  }).id;
}

setRolePermission = function(bot, calendar, node, roleName, perm, msg) {
  let roleId = getRoleIdByName(msg.channel.guild.roles, roleName);

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

setUserPermission = function(bot, calendar, node, username, perm, msg) {
  let userId = getUserIdByName(msg.channel.guild.members, username);

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

displayRolePermissions = function(bot, calendar, msg, roleName) {
  let roleId = getRoleIdByName(msg.channel.guild.roles, roleName);
  let resultString = "```css\nRole: " + roleName + "\nDenied Nodes: ";
  let deniedNodes = [];
  for (let perm of calendar.permissions) {
    if (perm.deniedRoles.find(id => { return id == roleId })) {
      deniedNodes.push(perm.node);
    }
  }

  if (deniedNodes.length == 0) {
    resultString = resultString + "None";
  }
  else {
    for (let i = 0; i < deniedNodes.length; i++) {
      resultString = resultString + deniedNodes[i];
      if (i < deniedNodes.length - 1) {
        resultString = resultString + ", ";
      }
    }
  }
  resultString = resultString + "\n```";

  msg.channel.createMessage(resultString);
}

displayUserPermissions = function(bot, calendar, msg, username) {
  let userId = getUserIdByName(msg.channel.guild.members, username);
  let resultString = "```css\nUser: " + username + "\nDenied Nodes: ";
  let deniedNodes = [];
  for (let perm of calendar.permissions) {
    if (perm.deniedUsers.find(id => { return id == userId })) {
      deniedNodes.push(perm.node);
    }
  }

  if (deniedNodes.length == 0) {
    resultString = resultString + "None";
  }
  else {
    for (let i = 0; i < deniedNodes.length; i++) {
      resultString = resultString + deniedNodes[i];
      if (i < deniedNodes.length - 1) {
        resultString = resultString + ", ";
      }
    }
  }
  resultString = resultString + "\n```";

  msg.channel.createMessage(resultString);
}


module.exports = PermsModule;