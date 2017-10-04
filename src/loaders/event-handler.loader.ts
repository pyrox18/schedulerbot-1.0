import * as winston from 'winston';

import { SchedulerBot } from '../classes/schedulerbot.class';
import { EventScheduler } from '../classes/event-scheduler.class';
import { CalendarModel as Calendar, CalendarDocument } from '../models/calendar.model';
import { BotConfig } from '../interfaces/bot-config.interface';
const config: BotConfig = require('../config/bot.config.json');;

export function loadEventHandlers(): void {
  let bot: SchedulerBot = SchedulerBot.getInstance();

  bot.on("guildCreate", async guild => {
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

  bot.on("guildDelete", async guild => {
    try {
      let calendar: CalendarDocument = await Calendar.findByIdAndRemove(guild.id).exec();
      let scheduler: EventScheduler = EventScheduler.getInstance();
      for (let event of calendar.events) {
        scheduler.unscheduleEvent(event);
      }
    } catch (err) {
      winston.error("guildDelete handler error", err);
    }
  });

  bot.on("guildMemberRemove", async (guild, member) => {
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

  bot.on("guildRoleDelete", async (guild, role) => {
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

export default loadEventHandlers;