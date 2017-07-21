const winston = require('winston');

class CommandError {
  constructor(err, bot, msg) {
    bot.createMessage(msg.channel.id, "An error has occurred. Please provide the message ID to the support server.\n```javascript\nMessage ID: " + msg.id + "\n" + err + "\n```");
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