import * as redisLock from 'redislock';
import { RedisClient } from 'redis';

import { SchedulerBot } from './schedulerbot.class';

export class CalendarLock {
  private redisClient: RedisClient;

  public constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  public async acquire(guildID: string): Promise<any> {
    let lock = redisLock.createLock(this.redisClient, {
      timeout: 5000,
      retries: -1,
      delay: 50
    });
    await lock.acquire(guildID);
    return lock;
  }
}

export default CalendarLock;