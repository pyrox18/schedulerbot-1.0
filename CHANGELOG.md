# Changelog

This changelog is formatted based on [Keep a Changelog](http://keepachangelog.com/) and this project attempts to adhere to [Semantic Versioning](http://semver.org) as much as possible.

## [Unreleased]

### Added

- Guilds can now have custom prefixes for the bot.

### Changed

- Calendar and event data is now stored in a MongoDB database.
- Files have been renamed to make its purpose more obvious (e.g. `event.command.js` is a file containing event-related commands).

## v0.1.0 - 2017-06-15

### Added

- Add calendar, event, ping and prefix commands.
- Store calendar and event data in a JSON file.