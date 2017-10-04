import { Message, CommandOptions, GuildChannel, Command, Collection, Role, Member } from 'eris';
import * as FuzzySet from 'fuzzyset.js';

import { CommandController } from './command.controller';
import { CalendarModel as Calendar, CalendarDocument } from '../models/calendar.model';
import { Perms } from '../interfaces/perms.interface';
import { FlagParser } from '../classes/flag-parser.class';
import { CommandError } from '../classes/command-error.class';
import { BotConfig } from '../interfaces/bot-config.interface';
const config: BotConfig = require('../config/bot.config.json');;

export class PermsController extends CommandController {
  protected commandOptions: CommandOptions;
  public static readonly nodes: string[] = [
    'event.create',
    'event.update',
    'event.delete',
    'event.list',
    'ping',
    'prefix.show',
    'prefix.modify',
    'perms.modify',
    'perms.nodes',
    'perms.show'
  ];

  constructor() {
    super();
    this.commandOptions = {
      guildOnly: true
    }
  }

  public modifyPerms = async (msg: Message, args: string[]): Promise<string> => {
    if (args.length < 4 || (args[0] != "allow" && args[0] != "deny")) return "Usage: `perms <allow|deny> <permNode> < --role <role> | --user <user> >`\nRun `perms nodes` for a list of available nodes.";
    try {
      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar) return "Calendar not found. Run `init <timezone>` to initialise the guild calendar.";
      if (!calendar.checkPerm('perms.modify', msg)) return "You are not permitted to use this command.";

      if (!PermsController.nodes.find(node => { return args[1] == node })) return "Node not found.";

      let flags: any = FlagParser.parse(args);
      if (!flags.role && !flags.user) return "Usage: `perms <allow|deny> <permNode> < --role <role> | --user <user> >`\nRun `perms nodes` for a list of available nodes.";
      if (Object.keys(flags).length > 1) return "Too many flags. Please select to modify the permission of a role or user.";

      let results: any[];
      if (flags.role) {
        results = this.findEntityNames((<GuildChannel>msg.channel).guild.roles, flags.role);
      }
      else {
        results = this.findEntityNames((<GuildChannel>msg.channel).guild.members, flags.user);
      }
      if (results.length < 1) return "No matching role/user found.";
      if (results.length > 1) {
        let resultString: string = "```css\n";
        for (let i = 0; i < results.length; i++) {
          resultString = resultString + `${i+1} : ${results[i][1]}\n`
        }
        resultString = resultString + "```";
        msg.channel.createMessage("Select one.\n" + resultString);
        setTimeout(() => {
          this.bot.once('messageCreate', msg => {
            let index = parseInt(msg.content);
            if (isNaN(index)) {
              return;
            }
            index = index - 1;
            if (flags.role) {
              this.setRolePermission(calendar, args[1], results[index][1], args[0], msg);  
            }
            else {
              this.setUserPermission(calendar, args[1], results[index][1], args[0], msg);
            }
          }); 
        }, 1000);
      }
      else {
        if (flags.role) {
          this.setRolePermission(calendar, args[1], results[0][1], args[0], msg);  
        }
        else {
          this.setUserPermission(calendar, args[1], results[0][1], args[0], msg);
        }
      }

      return "Permission successfully modified.";
    } catch (err) {
      return new CommandError(err).toString();
    }
  }

  public displayPermNodes = async (msg: Message, args: string[]): Promise<string> => {
    try {
      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar) return "Calendar not found. Run `init <timezone>` to initialise the guild calendar.";
      if (!calendar.checkPerm('perms.nodes', msg)) return "You are not permitted to use this command.";

      let nodes: string = "```css\n";
      for (let node of PermsController.nodes) {
        nodes = nodes + `${node}\n`;
      }
      nodes = nodes + "```";

      return nodes;
    } catch (err) {
      return new CommandError(err).toString();
    }
  }

  public showPerm = async (msg: Message, args: string[]): Promise<string> => {
    if (args.length < 2) return "Usage: `perms show < --node <permNode> | --role <role> | --user <user> >`";
    try {
      let calendar: CalendarDocument = await Calendar.findById((<GuildChannel>msg.channel).guild.id).exec();
      if (!calendar) return "Calendar not found. Run `init <timezone>` to initialise the guild calendar.";
      if (!calendar.checkPerm('perms.show', msg)) return "You are not permitted to use this command.";

      let flags: any = FlagParser.parse(args);
      if (!flags.node && !flags.role && !flags.user) return "Usage: `perms show < --node <permNode> | --role <role> | --user <user> >`";
      if (Object.keys(flags).length > 1) return "Too many flags. Please select to show permissions for a node, role or user.";

      if (flags.node) {
        if (!PermsController.nodes.find(node => { return node == flags.node })) return "The node does not exist.";
        let permNode: Perms = calendar.permissions.find(perm => {
          return perm.node == flags.node;
        });
        
        let resultString: string = "```css\nNode: " + flags.node + "\nDenied Roles: ";
        if (!permNode || permNode.deniedRoles.length == 0) {
          resultString = resultString + "None";
        }
        else {
          for (let i = 0; i < permNode.deniedRoles.length; i++) {
            resultString = resultString + (<GuildChannel>msg.channel).guild.roles.get(permNode.deniedRoles[i]).name;
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
            let user: Member = (<GuildChannel>msg.channel).guild.members.get(permNode.deniedUsers[i]);
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

        return resultString;
      }
      else {
        let results;
        if (flags.role) {
          results = this.findEntityNames((<GuildChannel>msg.channel).guild.roles, flags.role);
        }
        else {
          results = this.findEntityNames((<GuildChannel>msg.channel).guild.members, flags.user);
        }
        if (results.length < 1) return "No match found.";
        if (results.length > 1) {
          let resultString: string = "```css\n";
          for (let i = 0; i < results.length; i++) {
            resultString = resultString + `${i+1} : ${results[i][1]}\n`
          }
          resultString = resultString + "```";

          msg.channel.createMessage("Select one.\n" + resultString);
          setTimeout(() => {
            this.bot.once('messageCreate', msg => {
              let index = parseInt(msg.content);
              if (isNaN(index)) {
                return;
              }
              index = index - 1;
              if (flags.role) {
                return this.displayRolePermissions(calendar, msg, results[index][1]);
              }
              else {
                return this.displayUserPermissions(calendar, msg, results[index][1]);
              }
            }); 
          }, 1000);
        }
        else {
          if (flags.role) {
            return this.displayRolePermissions(calendar, msg, results[0][1]);  
          }
          else {
            return this.displayUserPermissions(calendar, msg, results[0][1]);  
          }
        }
      }
    } catch (err) {
      return new CommandError(err).toString();
    }
  }

  public registerCommands(): boolean {
    let permsCommand = this.bot.registerCommand("perms", this.modifyPerms, this.commandOptions);
    permsCommand.registerSubcommand("nodes", this.displayPermNodes, this.commandOptions);
    permsCommand.registerSubcommand("show", this.showPerm, this.commandOptions);
    return true;
  }

  private findEntityNames(entityCollection: Collection<Role> | Collection<Member>, targetName: string): any[] {
    let names: string[] = [];
    if (this.isRoleCollection(entityCollection)) {
      entityCollection.forEach((value, key, map) => {
        names.push(value.name);
      });
    }
    else {
      entityCollection.forEach((value, key, map) => {
        let result = `${value.username}#${value.discriminator}`;
        if (value.nick) {
          result += ` ${value.nick}`;
        }
        names.push(result);
      });
    }

    let fuzzyNames: any = FuzzySet(names);
    return fuzzyNames.get(targetName, null, 0.1);
  }

  private getRoleIdByName(roleCollection: Collection<Role>, roleName: string): string {
    return roleCollection.find(role => {
      return role.name == roleName;
    }).id;
  }

  private getUserIdByName(userCollection: Collection<Member>, username: string): string {
    return userCollection.find(member => {
      let fullName = `${member.username}#${member.discriminator}`;
      if (member.nick) {
        fullName = fullName + ` (${member.nick})`;
      }
      return fullName == username;
    }).id;
  }

  private setRolePermission = async (calendar: CalendarDocument, node: string, roleName: string, perm: string, msg: Message): Promise<boolean> => {
    let roleID: string = this.getRoleIdByName((<GuildChannel>msg.channel).guild.roles, roleName);
    if (perm == "deny") {
      await calendar.denyRolePerm(roleID, node);
    }
    else {
      await calendar.allowRolePerm(roleID, node);
    }
    return true;
  }

  private setUserPermission = async (calendar: CalendarDocument, node: string, username: string, perm: string, msg: Message): Promise<boolean> => {
    let userID: string = this.getUserIdByName((<GuildChannel>msg.channel).guild.members, username);
    if (perm == "deny") {
      await calendar.denyUserPerm(userID, node);
    }
    else {
      await calendar.allowUserPerm(userID, node);
    }
    return true;
  }

  private displayRolePermissions = (calendar: CalendarDocument, msg: Message, roleName: string): string => {
    let roleId: string = this.getRoleIdByName((<GuildChannel>msg.channel).guild.roles, roleName);
    let resultString: string = "```css\nRole: " + roleName + "\nDenied Nodes: ";
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

    return resultString;
  }

  private displayUserPermissions = (calendar: CalendarDocument, msg: Message, username: string): string => {
    let userId: string = this.getUserIdByName((<GuildChannel>msg.channel).guild.members, username);
    let resultString: string = "```css\nRole: " + username + "\nDenied Nodes: ";
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

    return resultString;
  }

  private isRoleCollection(entityCollection: Collection<Role> | Collection<Member>): entityCollection is Collection<Role> {
    return (<Collection<Role>>entityCollection).random().name != null;
  }
}