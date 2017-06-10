const Eris = require('eris');
const glob = require('glob');
const path = require('path');

const config = require('./config/bot');

global.appRoot = path.resolve(__dirname);
const prefix = config.prefix;

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
  bot.editStatus({
    name: "+help | In development"
  });

  console.log("Bot ready!");
});

bot.connect();