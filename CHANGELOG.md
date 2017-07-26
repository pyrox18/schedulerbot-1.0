# Changelog

This changelog is formatted based on [Keep a Changelog](http://keepachangelog.com/) and this project attempts to adhere to [Semantic Versioning](http://semver.org) as much as possible.

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
