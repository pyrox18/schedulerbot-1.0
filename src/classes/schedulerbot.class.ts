import { CommandClient, GamePresence } from 'eris';

import { loadCommands } from '../loaders/command.loader';
import { BotConfig } from '../interfaces/bot-config.interface';
const config: BotConfig = require('../config/bot.config.json');

// Acts as a singleton
export class SchedulerBot extends CommandClient {
  private static instance: SchedulerBot = new SchedulerBot();

  private constructor() {
    super(config.botToken, {}, {
      description: "A Discord bot for scheduling events",
      owner: "Pyrox",
      prefix: [config.prefix, "@mention "],
      defaultHelpCommand: false,
      defaultCommandOptions: {
        guildOnly: true
      }
    });
  }

  public static getInstance() {
    return this.instance;
  }
}

export default SchedulerBot;