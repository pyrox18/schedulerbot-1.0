import { Event } from './event.interface';
import { Perms } from './perms.interface';

export interface Calendar {
  _id: string,
  timezone: string,
  events: Event[],
  prefix: string,
  defaultChannel: string,
  permissions: Perms[]
}