// Descriptions for Eris commands

module.exports = {
  calendar: {
    description: "Initialise calendar.",
    fullDescription: "Initialises a calendar for the guild in the specified timezone.",
    usage: "`<timezone>`"
  },
  event: {
    add: {
      description: "Add a new event.",
      fullDescription: "Adds a new event to the guild calendar. Type the event details naturally (e.g. 'CS:GO scrims tomorrow from 6pm to 9pm') and the bot will interpret it for you.",
      usage: "`<event details>`"
    },
    list: {
      description: "List existing events.",
      fullDescription: "Displays a list of events that have been created."
    },
    delete: {
      description: "Delete an event.",
      fullDescription: "Delete an event from the existing event list.",
      usage: "`<event number>`"
    },
    update: {
      description: "Update an existing event.",
      fullDescription: "Updates an existing event in the guild calendar.",
      usage: "`<event number> <event details>`"
    }
  },
  ping: {
    description: "Ping the bot.",
    fullDescription: "Pings the bot to check if the bot is available."
  },
  prefix: {
    description: "Show or set prefix.",
    fullDescription: "Shows the bot's current prefix when called without arguments. To set a new prefix for the guild, call the command with the desired prefix after the command. You can also call the command by mentioning the bot (`@SchedulerBot prefix`) if you forget what the prefix is.",
    usage: "`[new prefix]`"
  },
  perms: {
    modify: {
      description: "Set role/user-specific command permissions.",
      fullDescription: "Allow or deny specific users/roles from the usage of certain commands.",
      usage: "`<allow|deny> <node> [--role <role>] [--user <user>]`"
    },
    nodes: {
      description: "Display available nodes.",
      fullDescription: "Display a list of available permission nodes."
    },
    show: {
      description: "Show the permissions related to a node, user or role.",
      fullDescription: "Display the permission settings granted in relation to a node, or to a role or user.",
      usage: '`--node <node>|--role <role>|--user <user>`'
    }
  }
}