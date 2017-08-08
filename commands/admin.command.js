const CommandError = require('../models/command-error.model');
const config = require('../config/bot.config');
const cmdOptions = require('../assets/command-options');

module.exports = (bot) => {
  bot.registerCommand('admincheck', (msg, args) => {
    return "Yes";
  }, cmdOptions.admin);

  bot.registerCommand('forceerror', (msg, args) => {
    try {
      throw new Error('test error');
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  }, cmdOptions.admin);
}

function isAdmin(id) {
  return id == config.adminId;
}