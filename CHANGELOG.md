# Changelog

This changelog is formatted based on [Keep a Changelog](http://keepachangelog.com/) and this project attempts to adhere to [Semantic Versioning](http://semver.org) as much as possible.

## [Unreleased]

### Added

- Guilds can now have custom prefixes for the bot.
- The bot will notify guild channels when an event is starting, and automatically remove events that have ended.

### Changed

- Calendar and event data is now stored in a MongoDB database.
- Files have been renamed to make its purpose more obvious (e.g. `event.command.js` is a file containing event-related commands).
- The `event list` command now displays active and upcoming events separately.
- Active events can no longer be updated.
- Events can no longer be created or updated with a start date that is in the past.

## v0.1.0 - 2017-06-15

### Added

- Add calendar, event, ping and prefix commands.
- Store calendar and event data in a JSON file.