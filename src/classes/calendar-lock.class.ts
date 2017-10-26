import * as redisLock from 'redislock';

import { SchedulerBot } from './schedulerbot.class';

export class CalendarLock {
  private _lock: any;
  private static _instance: CalendarLock = new CalendarLock();

  private constructor() {
    this._lock = redisLock.createLock(SchedulerBot.getInstance().redisClient, {
      timeout: 5000,
      retries: -1,
      delay: 50
    });
  }

  public static get instance() {
    return this._instance;
  }

  public get lock() {
    return this._lock;
  }
}

export default CalendarLock;