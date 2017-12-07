import { CommandClient, GamePresence } from 'eris';
import * as mongoose from 'mongoose';
import { RedisClient, createClient } from 'redis';
import * as winston from 'winston';

import { EventScheduler } from './event-scheduler.class';
import { CalendarDocument, CalendarModel as Calendar } from '../models/calendar.model';
import { BotConfig } from '../interfaces/bot-config.interface';
import { CommandController } from '../controllers/command.controller';
import { MiscController } from '../controllers/misc.controller';
import { CalendarController } from '../controllers/calendar.controller';
import { AdminController } from '../controllers/admin.controller';
import { PermsController } from '../controllers/perms.controller';
import { HelpController } from '../controllers/help.controller';
import { CalendarLock } from './calendar-lock.class';
const config: BotConfig = require('../config/bot.config.json');

// Acts as a singleton
export class SchedulerBot extends CommandClient {
  private _redisClient: RedisClient;
  private static _instance: SchedulerBot;
  private _db: mongoose.Connection;
  private _eventScheduler: EventScheduler;
  private _calendarLock: CalendarLock;
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

    this._calendarLock = new CalendarLock(this._redisClient);

    // Emit 'dbconnect' event when both data stores are connected
    let p1: Promise<boolean> = new Promise((resolve, reject) => {
      this.db.on('open', () => { resolve(true) });
    });
    let p2: Promise<boolean> = new Promise((resolve, reject) => {
      this.redisClient.on('ready', () => { resolve(true) });
    });
    Promise.all([p1, p2]).then(values => {
      this.emit('dbconnect');
    });

    // Load controllers, event handlers and data when ready
    this.on('ready', () => {
      console.log("Loading command controllers... ");
      this.loadControllers([
        new MiscController(this),
        new CalendarController(this),
        new AdminController(this),
        new PermsController(this),
        new HelpController(this)
      ]);
      console.log("Loading event handlers...");
      this.loadEventHandlers();
      console.log("Loading guild data...");
      (async () => await this.loadGuildData())();
      console.log("Configuring bot status... ");
      this.editStatus("online", config.game);
      console.log("Bot ready!");
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

  public get calendarLock() {
    return this._calendarLock;
  }

  public loadControllers(controllers: CommandController[]) {
    for (let controller of controllers) {
      this.controllers.push(controller);
      controller.registerCommands();
    }
  }

  public loadEventHandlers(): void {
    this.on("guildCreate", async guild => {
      try {
        let newGuild: CalendarDocument = new Calendar({
          _id: guild.id,
          prefix: config.prefix
        });
        await newGuild.save();
      } catch (err) {
        winston.error("guildCreate handler error", err);
      }
    });
  
    this.on("guildDelete", async guild => {
      try {
        let calendar: CalendarDocument = await Calendar.findByIdAndRemove(guild.id).exec();
        let scheduler: EventScheduler = this.eventScheduler;
        for (let event of calendar.events) {
          scheduler.unscheduleEvent(event);
        }
      } catch (err) {
        winston.error("guildDelete handler error", err);
      }
    });
  
    this.on("guildMemberRemove", async (guild, member) => {
      try {
        let calendar: CalendarDocument = await Calendar.findById(guild.id).exec();
        for (let perm of calendar.permissions) {
          let index: number = perm.deniedUsers.findIndex(id => { return id == member.id });
          if (index >= 0) {
            perm.deniedUsers.splice(index, 1);
          }
        }
    
        await calendar.save();
      } catch (err) {
        winston.error("guildMemberRemove handler error", err);
      }
    });
  
    this.on("guildRoleDelete", async (guild, role) => {
      try {
        let calendar: CalendarDocument = await Calendar.findById(guild.id).exec();
        for (let perm of calendar.permissions) {
          let index: number = perm.deniedRoles.findIndex(id => { return id == role.id });
          if (index >= 0) {
            perm.deniedRoles.splice(index, 1);
          }
        }
  
        await calendar.save();
      } catch (err) {
        winston.error("guildRoleDelete handler error", err);
      }
    });
  }

  public async loadGuildData(): Promise<void> {
    try {
      let calendars: CalendarDocument[] = await Calendar.find().exec();
      for (let calendar of calendars) {
        let prefixes: string[] = [calendar.prefix, "@mention "];
        this.registerGuildPrefix(calendar._id, prefixes);
        this.eventScheduler.scheduleExistingEvents(calendar);
      }
    } catch (err) {
      winston.error("Prefix load error", err);
    }
  }
}

export default SchedulerBot;