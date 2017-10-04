import { GamePresence } from 'eris';

// This interface is used for the bot.config.json file present in the config folder.
export interface BotConfig {
  readonly botToken: string, // Use your bot token here
  readonly prefix: string, // Production bot uses "+", use whatever you like for development
  readonly game: GamePresence, // Change the bot's status on Discord
  readonly dbConnectionUrl: string, // MongoDB instance URL
  readonly adminId: string, // Admin ID for admin-only command permission checks
  readonly version: string // Bot version number
}

export default BotConfig;