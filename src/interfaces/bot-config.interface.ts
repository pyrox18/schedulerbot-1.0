import { GamePresence } from 'eris';

export interface BotConfig {
  readonly botToken: string,
  readonly prefix: string,
  readonly game: GamePresence,
  readonly dbConnectionUrl: string,
  readonly adminId: string,
  readonly version: string
}

export default BotConfig;