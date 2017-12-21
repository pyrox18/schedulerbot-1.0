import { GuildChannel, Message } from "eris";
import * as raven from "raven";
import * as winston from "winston";

export class CommandError {
  private error: any;
  private message: Message;
  private eventID: string;

  constructor(error: any, msg: Message) {
    this.error = error;
    this.message = msg;
    if (process.env.NODE_ENV === "production") {
      this.eventID = raven.captureException(error, {
        user: {
          id: msg.author.id,
          username: `${msg.author.username}#${msg.author.discriminator}`
        },
        extra: {
          guildID: (msg.channel as GuildChannel).guild.id,
          messageContent: msg.content
        }
      });
    }
    winston.error(error);
  }

  public toString(): string {
    let str: string = "An error has occurred. Please report this in the support server using the `support` command.\n";
    if (process.env.NODE_ENV === "production") {
      str += `Error event ID: ${this.eventID}\n`;
    }
    str += "```\n";
    if (typeof this.error === "string") {
      str += this.error;
    }
    else if (this.error.message && typeof this.error.message === "string") {
      str += this.error.message;
    }
    else {
      str += "Unknown error";
    }
    str += "\n```";

    return str;
  }
}

export default CommandError;
