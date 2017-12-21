import { RedisClient } from "redis";
import * as redisLock from "redislock";

import { SchedulerBot } from "./schedulerbot.class";

export class CalendarLock {
  private redisClient: RedisClient;

  public constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  public async acquire(guildID: string): Promise<any> {
    const lock = redisLock.createLock(this.redisClient, {
      timeout: 5000,
      retries: -1,
      delay: 50
    });
    await lock.acquire(guildID);
    return lock;
  }
}

export default CalendarLock;
