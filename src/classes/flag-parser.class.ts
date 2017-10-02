export class FlagParser {
  constructor() { }

  public static parse(args: string[]): Object {
    let flagData: Object = {};
    let i: number = 0;
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