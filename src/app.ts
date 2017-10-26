import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import * as winston from 'winston';
import * as raven from 'raven';

import { SchedulerBot } from './classes/schedulerbot.class';
import { loadCommands } from './loaders/command.loader';
import { loadEventHandlers } from './loaders/event-handler.loader';
import { loadGuildData } from './loaders/guild-data.loader';
import { BotConfig } from './interfaces/bot-config.interface';
const config: BotConfig = require('./config/bot.config.json');

dotenv.config();

// Only setup Raven for prod
if (process.env.NODE_ENV == "production") {
  raven.config(config.ravenDSN, config.ravenConfigOptions).install();
}

let bot: SchedulerBot = SchedulerBot.getInstance();

(<any>mongoose).Promise = global.Promise;

mongoose.connect(config.dbConnectionUrl, {
  useMongoClient: true
});
let db: mongoose.Connection = mongoose.connection;

db.on('error', (err) => {
  winston.error('DB connection error: ' + err);
  process.exit(1);
});

db.once('open', () => {
  console.log("Connected to database");
  //TODO: Add MongoDB transport for winston if fixed
  bot.connect();
});

bot.on('ready', () => {
  console.log("Loading commands... ");
  loadCommands();
  console.log("Loading event handlers...");
  loadEventHandlers();
  console.log("Loading guild data...");
  loadGuildData();
  console.log("Configuring bot status... ");
  bot.editStatus("online", config.game);
  console.log("Bot ready!");
});