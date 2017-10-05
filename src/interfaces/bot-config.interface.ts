import { GamePresence } from 'eris';
import { ConstructorOptions } from 'raven';

// This interface is used for the bot.config.json file present in the config folder.
export interface BotConfig {
  readonly botToken: string, // Use your bot token here
  readonly prefix: string, // Production bot uses "+", use whatever you like for development
  readonly game: GamePresence, // Change the bot's status on Discord
  readonly dbConnectionUrl: string, // MongoDB instance URL
  readonly adminId: string, // Admin ID for admin-only command permission checks
  readonly ravenDSN: string, // DSN for Sentry error logging
  readonly ravenConfigOptions: ConstructorOptions // Raven constructor config options
}

export default BotConfig;