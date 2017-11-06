import { CommandClient, GamePresence } from 'eris';
import { RedisClient, createClient } from 'redis';

import { loadCommands } from '../loaders/command.loader';
import { BotConfig } from '../interfaces/bot-config.interface';
const config: BotConfig = require('../config/bot.config.json');

// Acts as a singleton
export class SchedulerBot extends CommandClient {
  private _redisClient: RedisClient;
  private static _instance: SchedulerBot;

  private constructor() {
    super(config.botToken, {}, {
      description: "A Discord bot for scheduling events",
      owner: "Pyrox",
      prefix: [config.prefix, "@mention "],
      defaultHelpCommand: false,
      defaultCommandOptions: {
        guildOnly: true,
        cooldown: 1000,
        cooldownMessage: "Command is on cooldown.",
        cooldownReturns: 1
      }
    });

    let redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
    this._redisClient = createClient(redisPort);
    this._redisClient.on('ready', () => {
      console.log("Connected to Redis server");
    });
  }

  public static get instance() {
    if (!this._instance) {
      this._instance = new SchedulerBot();
    }
    return this._instance;
  }

  public get redisClient() {
    return this._redisClient;
  }
}

export default SchedulerBot;