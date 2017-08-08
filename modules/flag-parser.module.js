class FlagParser {
  static parse(args) {
    let flagData = {};
    let i = 0;
    while (i < args.length) {
      if (args[i].includes('--')) {
        let key = args[i].slice(2);
        let values = [];
        i++;
        while (i < args.length && !args[i].includes('--')) {
          values.push(args[i]);
          i++;
        }
        flagData[key] = values.join(' ');
        i--;
      }
      i++;
    }
    
    return flagData;
  }
}

module.exports = FlagParser;