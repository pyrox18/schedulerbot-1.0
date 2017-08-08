// Options for Eris commands

const adminId = require('../config/bot.config').adminId;

module.exports = {
  calendar: {
    description: "Initialise calendar.",
    fullDescription: "Initialises a calendar for the guild in the specified timezone.",
    usage: "`<timezone>`",
    guildOnly: true
  },
  event: {
    add: {
      description: "Add a new event.",
      fullDescription: "Adds a new event to the guild calendar. Type the event details naturally (e.g. 'CS:GO scrims tomorrow from 6pm to 9pm') and the bot will interpret it for you.",
      usage: "`<event details>`",
      guildOnly: true
    },
    list: {
      description: "List existing events.",
      fullDescription: "Displays a list of events that have been created.",
      guildOnly: true
    },
    delete: {
      description: "Delete an event.",
      fullDescription: "Delete an event from the existing event list.",
      usage: "`<event number>`",
      guildOnly: true
    },
    update: {
      description: "Update an existing event.",
      fullDescription: "Updates an existing event in the guild calendar.",
      usage: "`<event number> <event details>`",
      guildOnly: true
    }
  },
  ping: {
    description: "Ping the bot.",
    fullDescription: "Pings the bot to check if the bot is available.",
    guildOnly: true
  },
  prefix: {
    description: "Show or set prefix.",
    fullDescription: "Shows the bot's current prefix when called without arguments. To set a new prefix for the guild, call the command with the desired prefix after the command. You can also call the command by mentioning the bot (`@SchedulerBot prefix`) if you forget what the prefix is.",
    usage: "`[new prefix]`",
    guildOnly: true
  },
  perms: {
    modify: {
      description: "Set role/user-specific command permissions.",
      fullDescription: "Allow or deny specific users/roles from the usage of certain commands.",
      usage: "`<allow|deny> <node> [--role <role>] [--user <user>]`",
      guildOnly: true
    },
    nodes: {
      description: "Display available nodes.",
      fullDescription: "Display a list of available permission nodes.",
      guildOnly: true
    },
    show: {
      description: "Show the permissions related to a node, user or role.",
      fullDescription: "Display the permission settings granted in relation to a node, or to a role or user.",
      usage: '`--node <node>|--role <role>|--user <user>`',
      guildOnly: true
    }
  },
  support: {
    description: "Show the invite link to the support server.",
    fullDescription: "Displays the invite link to the SchedulerBot support server, where you can report bugs and issues about the bot.",
    guildOnly: true
  },
  invite: {
    description: "Display a link to invite the bot to your server.",
    fullDescription: "Displays the invite link to invite SchedulerBot to one of your own servers.",
    guildOnly: true
  },
  info: {
    description: "Display statistics about the bot.",
    fullDescription: "Displays the bot's version, number of guilds and users being served, and the bot's uptime.",
    guildOnly: true
  },
  // Special admin command options; applies to all commands in admin.command
  admin: {
    requirements: {
      userIDs: [adminId]
    }
  }
}