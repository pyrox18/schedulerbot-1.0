const Eris = require('eris');
const glob = require('glob');
const path = require('path');
const mongoose = require('mongoose');

const config = require('./config/bot');

const prefix = config.prefix;


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
  prefix: [prefix, "@mention "]
});

bot.on("ready", () => {
  glob.sync('./commands/**/*.js').forEach(file => {
    const actualCommand = require(path.resolve(file));
    actualCommand(bot);
  });

  // Set bot's Playing text
  bot.editStatus(config.game);

  console.log("Bot ready!");
});

bot.connect();