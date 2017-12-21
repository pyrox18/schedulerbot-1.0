import { GamePresence } from "eris";
import { ConstructorOptions } from "raven";

// This interface is used for the bot.config.ts file present in the config folder.
export interface BotConfig {
  readonly prefix: string; // Production bot uses "+", use whatever you like for development
  readonly game: GamePresence; // Change the bot's status on Discord
  readonly adminId: string; // Admin ID for admin-only command permission checks
}

export default BotConfig;
