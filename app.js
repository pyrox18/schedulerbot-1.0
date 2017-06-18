const Eris = require('eris');
const glob = require('glob');
const path = require('path');
const mongoose = require('mongoose');

const config = require('./config/bot.config');
const Prefix = require('./models/prefix.model');

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
  Prefix.find((err, prefixes) => {
    for (let guild of prefixes) {
      let prefixes = [guild.prefix, bot.user.mention + " "];
      bot.registerGuildPrefix(guild.guildId, prefixes);
    }
  });

  // Set bot's Playing text
  bot.editStatus(config.game);

  console.log("Bot ready!");
});

bot.on('guildCreate', guild => {
  // Create new Prefix document when joining a guild
  let newGuild = new Prefix({
    guildId: guild.id,
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
  Prefix.findOneAndRemove({ guildId: guild.id }, (error, document) => {
    console.log(`Deleted guildId ${document.guildId} from Prefix collection`);
  });
});

bot.connect();