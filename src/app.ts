import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import * as winston from 'winston';
import * as raven from 'raven';

import { SchedulerBot } from './classes/schedulerbot.class';
import { BotConfig } from './interfaces/bot-config.interface';
import { config } from './config/bot.config';

dotenv.config();

(<any>mongoose).Promise = global.Promise;

// Only setup Raven for prod
if (process.env.NODE_ENV == "production") {
  raven.config(process.env.SENTRY_DSN).install();
}

let bot: SchedulerBot = new SchedulerBot();

bot.on('dbconnect', () => bot.connect());