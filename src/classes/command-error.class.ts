import * as winston from 'winston';

export class CommandError {
  private error: any;

  constructor(error: any) {
    this.error = error;
    winston.error(error);
  }

  public toString(): string {
    let str: string = "An error has occurred. Please report this in the support server using the `support` command.\n```\n";
    if (typeof this.error == "string") str += this.error;
    else if (this.error.message && typeof this.error.message == "string") str += this.error.message;
    else str += "Unknown error";
    str += "\n```";

    return str;
  }
}

export default CommandError;