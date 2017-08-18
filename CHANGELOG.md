# Changelog

This changelog is formatted based on [Keep a Changelog](http://keepachangelog.com/) and this project attempts to adhere to [Semantic Versioning](http://semver.org) as much as possible.

## v0.4.0 - 2017-08-18

### Added:

- New `info` command allows users to see the bot's version, number of guilds and users serving, and uptime.
- New admin command set for the bot owner to perform restricted actions (like forcing errors for testing purposes) easily. Not accessible to any other users except for the bot owner.

### Changed:

- The interaction between command declarations and its corresponding modules has been revised so that modules now return standardised responses, which the commands then interpret to send a response to the user on Discord.

### Fixed:

- When a guild is deleted (i.e. the bot is kicked from a server), the scheduler module now unschedules events that are in the guild's calendar before deleting the calendar from the database. Previously, the bot would not unschedule those events, and would crash when attempting to send a scheduled notification message to the deleted guild.

## v0.3.2 - 2017-07-31

### Changed:

- Changed error handling in the bot's event scheduling module to prevent the bot from crashing under certain situations.

## v0.3.1 - 2017-07-29

### Fixed:

- Replaced prompts that incorrectly informed users to run `calendar <timezone>` with `init <timezone>`.

### Changed:

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
