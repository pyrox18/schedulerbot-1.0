const Eris = require('eris');
const glob = require('glob');
const path = require('path');
const mongoose = require('mongoose');
const winston = require('winston');
require('winston-mongodb').MongoDB;

const config = require('./config/bot.config');
const Calendar = require('./models/calendar.model');
const scheduler = require('./modules/scheduler.module');

// Make mongoose use native Promises
mongoose.Promise = global.Promise;

// Connect to database
mongoose.connect(config.dbConnectionUrl, {
  useMongoClient: true
});
db = mongoose.connection;

db.on('error', (err) => {
  winston.error('DB connection error: ' + err);
  process.exit(1);
});

db.once('open', () => {
  console.log('Connected to database');
  winston.add(winston.transports.MongoDB, { db: config.dbConnectionUrl });
  bot.connect();
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
  })
});

bot.on('guildDelete', guild => {
  // Delete Prefix document of guild when leaving a guild
  Calendar.findOneAndRemove({ _id: guild.id }, (err, calendar) => {
    if (err) {
      winston.error('guildDelete error: ' + err);
    }
    for (let event of calendar.events) {
      scheduler.unscheduleEvent(event._id.toString());
    }
  });
});

bot.on('guildMemberRemove', (guild, member) => {
  Calendar.findById(guild.id, (err, calendar) => {
    for (let perm of calendar.permissions) {
      let index = perm.deniedUsers.findIndex(id => { return id == member.id });
      if (index >= 0) {
        perm.deniedUsers.splice(index, 1);
      }
    }

    calendar.save(err => {
      if (err) {
        winston.error('guildMemberRemove error: ' + err);
      }
    });
  });
});

bot.on('guildRoleDelete', (guild, role) => {
  Calendar.findById(guild.id, (err, calendar) => {
    for (let perm of calendar.permissions) {
      let index = perm.deniedRoles.findIndex(id => { return id == role.id });
      if (index >= 0) {
        perm.deniedRoles.splice(index, 1);
      }
    }

    calendar.save(err => {
      if (err) {
        winston.error('guildRoleDelete error: ' + err);
      }
    });
  });
});