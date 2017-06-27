const winston = require('winston');
winston.add(winston.transports.File, { filename: 'schedulerbot.log' });

class CommandError {
  constructor(err, bot, msg) {
    bot.createMessage(msg.channel.id, "An error has occurred.\n```" + err + "\n```");
    winston.log('error', err, { 
      guildId: msg.channel.guild.id,
      msg: {
        id: msg.id,
        content: msg.content
      }
    });
  }
}

module.exports = CommandError;