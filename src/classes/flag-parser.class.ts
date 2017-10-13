export class FlagParser {
  constructor() { }

  public static parse(args: string[]): any {
    let flagData: any = {};
    let i: number = 0;
    let body: string[] = [];

    // Push the arg as body text until the first flag is detected
    while (i < args.length && !args[i].startsWith('--')) {
      body.push(args[i]);
      i++;
    }
    flagData._body = body.join(' ');

    // Parse the flags in args
    while (i < args.length) {
      if (args[i].includes('--')) {
        let key: string = args[i].slice(2);
        let values: string[] = [];
        i++;
        while (i < args.length && !args[i].includes('--')) {
          values.push(args[i]);
          i++;
        }
        flagData[key] = values.join(' ');
        i--;
      }
      i++
    }

    return flagData;
  }
}

export default FlagParser;