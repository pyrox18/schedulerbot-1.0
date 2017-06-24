const Eris = require('eris');
const glob = require('glob');
const path = require('path');
const mongoose = require('mongoose');

const config = require('./config/bot.config');
const Calendar = require('./models/calendar.model');
const scheduler = require('./modules/scheduler.module');

// Connect to database
mongoose.connect(config.dbConnectionUrl);
db = mongoose.connection;

db.on('error', (err) => {
  console.error('DB connection error: ' + err);
});

db.once('open', () => {
  console.log('Connected to database');
});

// Bot setup
bot = new Eris.CommandClient(config.botToken, {}, {
  description: "A Discord bot for scheduling events",
  owner: "Pyrox",
  prefix: [config.prefix, "@mention "]
});

bot.on("ready", () => {
  // Register commands
  glob.sync('./commands/**/*.command.js').forEach(file => {
    const actualCommand = require(path.resolve(file));
    actualCommand(bot);
  });

  // Load all guild prefixes
  Calendar.find((err, calendars) => {
    for (let calendar of calendars) {
      let prefixes = [calendar.prefix, bot.user.mention + " "];
      bot.registerGuildPrefix(calendar._id, prefixes);
      scheduler.scheduleExistingEvents(bot, calendar);
    }
  });

  // Set bot's Playing text
  bot.editStatus(config.game);

  console.log("Bot ready!");
});

bot.on('guildCreate', guild => {
  // Create new Prefix document when joining a guild
  let newGuild = new Calendar({
    _id: guild.id,
    prefix: config.prefix
  });
  newGuild.save(err => {
    if (err) {
      console.error(err);
    }
  })
});

bot.on('guildDelete', guild => {
  // Delete Prefix document of guild when leaving a guild
  Calendar.findOneAndRemove({ _id: guild.id }, (error, document) => {
    console.log(`Deleted guildId ${document._id} from Calendar collection`);
  });
});

bot.connect();