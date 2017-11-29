import { CommandClient, GamePresence } from 'eris';
import * as mongoose from 'mongoose';
import { RedisClient, createClient } from 'redis';

import { EventScheduler } from './event-scheduler.class';
import { loadCommands } from '../loaders/command.loader';
import { BotConfig } from '../interfaces/bot-config.interface';
import { CommandController } from '../controllers/command.controller';
import { MiscController } from '../controllers/misc.controller';
import { CalendarController } from '../controllers/calendar.controller';
import { AdminController } from '../controllers/admin.controller';
import { PermsController } from '../controllers/perms.controller';
import { HelpController } from '../controllers/help.controller';
const config: BotConfig = require('../config/bot.config.json');

// Acts as a singleton
export class SchedulerBot extends CommandClient {
  private _redisClient: RedisClient;
  private static _instance: SchedulerBot;
  private _db: mongoose.Connection;
  private _eventScheduler: EventScheduler;
  private controllers: CommandController[];

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

    this.controllers = [];
    this._eventScheduler = new EventScheduler(this);

    mongoose.connect(config.dbConnectionUrl, {
      useMongoClient: true
    });
    this._db = mongoose.connection;
    this._db.on('open', () => {
      console.log("Connected to database");
      // TODO: Add MongoDB transport for winston if fixed
    });
    this._db.on('error', err => {
      console.log("Mongoose error: " + err);
      process.exit();
    });

    let redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
    this._redisClient = createClient(redisPort);
    this._redisClient.on('ready', () => {
      console.log("Connected to Redis server");
    });
    this._redisClient.on('error', err => {
      console.log("Redis error: " + err);
      process.exit();
    });

    this.on('ready', () => {
      console.log("Loading command controllers... ");
      this.loadControllers([
        new MiscController(),
        new CalendarController(),
        new AdminController(),
        new PermsController(),
        new HelpController()
      ]);
    });
  }

  public static get instance() {
    if (!this._instance) {
      this._instance = new SchedulerBot();
    }
    return this._instance;
  }

  public get db() {
    return this._db;
  }

  public get redisClient() {
    return this._redisClient;
  }

  public get eventScheduler() {
    return this._eventScheduler;
  }

  public loadControllers(controllers: CommandController[]) {
    for (let controller of controllers) {
      this.controllers.push(controller);
      controller.registerCommands();
    }
  }
}

export default SchedulerBot;