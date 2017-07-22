const CommandError = require('../models/command-error.model');
const config = require('../config/bot.config');

module.exports = (bot) => {
  bot.registerCommand('admincheck', (msg, args) => {
    if (isAdmin(msg.member.id)) {
      return "Yes";
    }
    return;
  });

  bot.registerCommand('forceerror', (msg, args) => {
    if (!isAdmin(msg.member.id)) return;
    try {
      throw new Error('test error');
    }
    catch (err) {
      new CommandError(err, bot, msg);
    }
  });
}

function isAdmin(id) {
  return id == config.adminId;
}