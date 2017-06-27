const Eris = require('eris');
const glob = require('glob');
const path = require('path');
const mongoose = require('mongoose');
const winston = require('winston');

const config = require('./config/bot.config');
const Calendar = require('./models/calendar.model');
const scheduler = require('./modules/scheduler.module');

// Winston config
winston.add(winston.transports.File, { filename: 'schedulerbot.log' });

// Make mongoose use native Promises
mongoose.Promise = global.Promise;

// Connect to database
mongoose.connect(config.dbConnectionUrl);
db = mongoose.connection;

db.on('error', (err) => {
  winston.error('DB connection error: ' + err);
  exit(1);
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
    if (err) {
      winston.error("Guild prefix load error: " + err);
      exit(1);
    }
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
      winston.error('guildCreate error: ' + err);
    }
    else {
      winston.info('guildCreate called', {
        guildId: newGuild._id
      });
    }
  })
});

bot.on('guildDelete', guild => {
  // Delete Prefix document of guild when leaving a guild
  Calendar.findOneAndRemove({ _id: guild.id }, (err, document) => {
    if (err) {
      winston.error('guildDelete error: ' + err);
    }
    else {
      winston.info('guildDelete called', {
        guildId: document._id
      });
    }
  });
});

bot.connect();