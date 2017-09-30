import { CommandClient, GamePresence } from 'eris';

import config from '../config/bot.config';
import { loadCommands } from '../loaders/command.loader';

// Acts as a singleton
export class SchedulerBot extends CommandClient {
  private static instance: SchedulerBot = new SchedulerBot();

  private constructor() {
    super(config.botToken, {}, {
      description: "A Discord bot for scheduling events",
      owner: "Pyrox",
      prefix: [config.prefix, "@mention "]
    });
  }

  public static getInstance() {
    return this.instance;
  }
}

export default SchedulerBot;