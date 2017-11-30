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

(<any>mongoose).Promise = global.Promise;

// Only setup Raven for prod
if (process.env.NODE_ENV == "production") {
  raven.config(config.ravenDSN, config.ravenConfigOptions).install();
}

let bot: SchedulerBot = SchedulerBot.instance;

// Wait for data stores to connect, then connect bot
let p1: Promise<boolean> = new Promise((resolve, reject) => {
  bot.db.on('open', () => { resolve(true) });
});
let p2: Promise<boolean> = new Promise((resolve, reject) => {
  bot.redisClient.on('ready', () => { resolve(true) });
});

Promise.all([p1, p2]).then(values => {
  bot.connect();
});