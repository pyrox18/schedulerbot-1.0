import * as redisLock from 'redislock';

import { SchedulerBot } from './schedulerbot.class';

export class CalendarLock {
  public static async acquire(guildID: string): Promise<any> {
    let lock = redisLock.createLock(SchedulerBot.instance.redisClient, {
      timeout: 5000,
      retries: -1,
      delay: 50
    });
    await lock.acquire(guildID);
    return lock;
  }
}

export default CalendarLock;