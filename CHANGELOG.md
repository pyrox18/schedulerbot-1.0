# Changelog

This changelog is formatted based on [Keep a Changelog](http://keepachangelog.com/) and this project attempts to adhere to [Semantic Versioning](http://semver.org) as much as possible.

## v0.5.1 - 2017-10-06

### Fixed

- Fixed an issue where event notification jobs were not being unscheduled properly when updating or deleting events. ([`6ec58bf`](https://github.com/pyrox18/schedulerbot/commit/6ec58bf385db7b4c820513b578d16d569bfe8186))

## v0.5.0 - 2017-10-05

This release features a complete migration of the codebase to TypeScript, as well as a complete restructure of the bot's source code tree. As a result, this release breaks pretty much everything in the source code from the previous releases, but users should be able to use the same commands and functionality as before.

### Added

- All commands now have a default cooldown of 1 second. ([`9242a39`](https://github.com/pyrox18/schedulerbot/commit/9242a397d9e8cf711683b43bf89976933184420c))
- Common response strings are now stored in an independent resource file (`src/config/strings.resource.json`). ([`d0d76e5`](https://github.com/pyrox18/schedulerbot/commit/d0d76e58219f3d0925265c65f2797cc82ec17e9d))

### Changed

- Migrated the entire codebase to TypeScript.
- The `help` command and its subcommands now display rich embeds for the base help information and information for the `init`, `event`, `perms` and `prefix` commands. ([`e745d8d`](https://github.com/pyrox18/schedulerbot/commit/e745d8d763f87cccc9bfb75a9a28178f36712397))
- The `info` command now displays information in a rich embed. ([`0a9405d`](https://github.com/pyrox18/schedulerbot/commit/0a9405dd868657b74477f194873b1dfa44ab0c30))
- EventScheduler (previously Scheduler before the migration) now uses the ES6 Map data structure to store jobs. Map keys are now set to the actual ObjectID of the event document instead of the string equivalent. ([`cdf622c`](https://github.com/pyrox18/schedulerbot/commit/cdf622cf53cf363e754893b906bd835839f78a6c))

### Fixed

- Fixed a bug where event dates were being assigned timezones, but the dates themselves were not adjusted back to the values given by the user. ([`5946d22`](https://github.com/pyrox18/schedulerbot/commit/5946d225af459399c87aa776d61da35ae4e8e8ee))

### Removed

- Removed certain npm dependencies that are no longer used by the bot. ([`ecd91b5`](https://github.com/pyrox18/schedulerbot/commit/ecd91b5fbf3c79fd75235a2270284b1c7adfac17))

## v0.4.2 - 2017-08-23

### Changed

- Changed the way the bot handles command flags (like `--role` and `--user`) as a preparation for future features.
- Modified the event creation and updating behaviour so that end dates cannot be set before start dates.
- Event dates are now stored as ISODate objects in the database instead of Strings that contain ISO 8601 date representations.

### Fixed

- Fixed a bug where start dates were implied incorrectly in certain locations when the user did not supply a date in the `event` and `event update` commands, resulting in the bot thinking that the event starts in the past.

## v0.4.1 - 2017-08-22

### Changed

- Updated the bot's dependencies to solve certain issues.
- Changed the handling of how the bot loads the alternative prefix (bot mention).

### Fixed

- Invalid command entries should now make the bot provide an appropriate response.
- The bot's status message should now display properly, as a Discord API update broke the previous implementation of the status setter in the Eris library.

## v0.4.0 - 2017-08-18

### Added

- New `info` command allows users to see the bot's version, number of guilds and users serving, and uptime.
- New admin command set for the bot owner to perform restricted actions (like forcing errors for testing purposes) easily. Not accessible to any other users except for the bot owner.

### Changed

- The interaction between command declarations and its corresponding modules has been revised so that modules now return standardised responses, which the commands then interpret to send a response to the user on Discord.

### Fixed

- When a guild is deleted (i.e. the bot is kicked from a server), the scheduler module now unschedules events that are in the guild's calendar before deleting the calendar from the database. Previously, the bot would not unschedule those events, and would crash when attempting to send a scheduled notification message to the deleted guild.

## v0.3.2 - 2017-07-31

### Changed

- Changed error handling in the bot's event scheduling module to prevent the bot from crashing under certain situations.

## v0.3.1 - 2017-07-29

### Fixed

- Replaced prompts that incorrectly informed users to run `calendar <timezone>` with `init <timezone>`.

### Changed

- Replaced "Invalid input" messages with command usage guides.
- Changed the support server link provided in the `support` command to lead to the #welcome channel.

## v0.3.0 - 2017-07-27

### Added

- New `support` and `invite` commands displays links to the support server and to invite the bot to someone's server, respectively.

## v0.2.0 - 2017-07-26

### Added

- Guilds can now have custom prefixes for the bot.
- The bot will notify guild channels when an event is starting, and automatically remove events that have ended.
- Added a permissions system to control the usage of commands on a per-user and per-role basis.
- Error messages are now displayed on Discord when the bot encounters any errors.

### Changed

- Calendar and event data is now stored in a MongoDB database.
- The `event list` command now displays active and upcoming events separately.
- Active events can no longer be updated.
- Events can no longer be created or updated with a start date that is in the past.
- Internal: Files have been renamed to make its purpose more obvious (e.g. `event.command.js` is a file containing event-related commands).

## v0.1.0 - 2017-06-15

### Added

- Add calendar, event, ping and prefix commands.
- Store calendar and event data in a JSON file.
