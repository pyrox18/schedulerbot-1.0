const Eris = require('eris');
require('eris-embed-builder');
const jsonfile = require('jsonfile');
const chrono = require('chrono-node');
const moment = require('moment-timezone');

const Calendar = require('./models/calendar');
const CalendarEvent = require('./models/calendar-event');

const config = require('./config/bot');

let prefix = "+";
let file = config.calendarJsonFile;
let calendars;

try {
  jsonfile.readFile(file, (err, obj) => {
    if (obj == null) {
      calendars = [];
    }
    else {
      calendars = obj;
    }
  });
}
catch (err) {
  console.error("File read failure: " + err);
  process.exit();
}

let bot = new Eris.CommandClient(config.botToken, {}, {
  description: "A Discord bot for scheduling events",
  owner: "Pyrox",
  prefix: [prefix, "@mention "]
});

bot.on("ready", () => {
  console.log("Bot ready!");
});

bot.registerCommand("ping", "Pong!", {
  description: "Pong!",
  fullDescription: "Checks to see if the bot is alive."
});

bot.registerCommand("prefix", "`" + prefix + "`", {
  description: "Show prefix.",
  fullDescription: "Shows the bot's current prefix."
});

let calendarCommand = bot.registerCommand("calendar", (msg, args) =>  {
  if (args.length > 1 || args.length < 1) {
    return "Invalid input.";
  }

  let timezone = args[0];
  let calendarExists = false;
  for (let i of calendars) {
    if (i.guildId == msg.channel.guild.id) {
      calendarExists = true;
      break;
    }
  }

  if (calendarExists) {
    return "The guild calendar has already been initialised.";
  }
  else {
    console.log(timezone);
    if (moment.tz.zone(timezone) === null) {
      return "Timezone not found. See https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List under the TZ column for available timezones.";
    }
    else {
      calendars.push(new Calendar(msg.channel.guild.id, timezone));
      console.log(calendars);
      jsonfile.writeFile(file, calendars, err => {
        if (err) console.error(err);
      });
      return "Initialised calendar for guild ID " + msg.channel.guild.id + " with timezone " + timezone + ".";
    }
  }
}, {
  description: "Initialise calendar.",
  fullDescription: "Initialises a calendar for the guild."
});

let eventCommand = bot.registerCommand("event", (msg, args) => {
  if (args.length < 1) {
    return "Invalid input.";
  }

  for (let i of calendars) {
    if (i.guildId == msg.channel.guild.id) {
      let inputString = args.join(" ");
      let results = chrono.parse(inputString);

      inputString = inputString.replace(results[0].text, "");
      inputString = inputString.trim();

      let eventName = inputString;
      let startDate = results[0].start.date();
      let endDate;
      try {
        endDate = results[0].end.date();
      }
      catch (err) {
        endDate = new Date(results[0].start.date().getTime() + 3600000);
      }

      i.events.push(new CalendarEvent(eventName, startDate, endDate));
      jsonfile.writeFile(file, calendars, err => {
        if (err) console.error(err);
      });

      let embed = bot.createEmbed(msg.channel.id);
      embed.title("New Event");
      embed.color(0x7caeff);
      embed.field("Event Name", eventName, false);
      embed.field("Start Date", startDate.toString(), false);
      embed.field("End Date", endDate.toString(), false);
      
      embed.send(bot, msg.channel.id);
      return "New event created.";
    }
  }

  return "Calendar not initialized. Please run `" + prefix + "calendar` to initialize the calendar first.";

});

bot.connect();