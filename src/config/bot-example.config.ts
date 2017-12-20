import { BotConfig } from '../interfaces/bot-config.interface';
const packageFile: any = require('../../package.json');

export const config: BotConfig = {
  prefix: "+",
  game: {
    name: `+help | v${packageFile.version}`
  },
  adminId: "1234567890123456"
}

export default config;