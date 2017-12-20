import { EmbedBase } from 'eris';
import * as moment from 'moment-timezone';

import { EventDocument } from '../models/event.model';

export class EventEmbedFactory {
  public readonly colours = {
    NEW_EVENT: 8171263,
    DELETE_EVENT: 16722731,
    UPDATE_EVENT: 16775221
  }

  constructor() { }

  private getBaseEmbed(event: EventDocument, timezone: string): EmbedBase {
    const embed: EmbedBase = {
      author: {
        name: "SchedulerBot",
        icon_url: "https://cdn.discordapp.com/avatars/339019867325726722/e5fca7dbae7156e05c013766fa498fe1.png"
      },
      fields: [
        {
          name: "Event Name",
          value: event.name
        },
        {
          name: "Description",
          value: event.description || "*N/A*"
        },
        {
          name: "Start Date",
          value: moment(event.startDate).tz(timezone).toString(),
          inline: true
        },
        {
          name: "End Date",
          value: moment(event.endDate).tz(timezone).toString(),
          inline: true
        },
        {
          name: "Repeat",
          value: event.repeat ? (event.repeat == "d" ? "Daily" : (event.repeat == "w" ? "Weekly" : "Monthly")) : "*N/A*"
        }
      ]
    }
    return embed;
  }

  public getNewEventEmbed(event: EventDocument, timezone: string): EmbedBase {
    const embed: EmbedBase = this.getBaseEmbed(event, timezone);
    embed.title = "New Event";
    embed.color = this.colours.NEW_EVENT
    return embed;
  }

  public getDeleteEventEmbed(event: EventDocument, timezone: string): EmbedBase {
    const embed: EmbedBase = this.getBaseEmbed(event, timezone);
    embed.title = "Delete Event";
    embed.color = this.colours.DELETE_EVENT;
    return embed;
  }

  public getUpdateEventEmbed(event: EventDocument, timezone: string): EmbedBase {
    const embed: EmbedBase = this.getBaseEmbed(event, timezone);
    embed.title = "Update Event";
    embed.color = this.colours.UPDATE_EVENT;
    return embed;
  }
}

export default EventEmbedFactory;