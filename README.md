# SchedulerBot

A Discord bot for scheduling events.

This bot uses the [Eris](https://abal.moe/Eris/) library. Reference documentation can be found at https://abal.moe/Eris/docs.

## Installation

This project requires [NodeJS](https://nodejs.org) v7.6 or later, [npm](https://npmjs.com), [MongoDB](https://mongodb.com) and [Redis](https://redis.io). Install these first before continuing. (**NOTE**: npm comes with NodeJS.)

To get started, clone the repository:

```bash
$ git clone https://github.com/pyrox18/schedulerbot.git
$ cd schedulerbot
$ npm install
```

## Usage

### First-time Setup

Before running the bot, you will have to create a Discord Developer App at https://discordapp.com/developers/applications/me.

1. Create a new app by clicking on 'New App'.
2. Give it a name (e.g. "SchedulerBot Pyrox"), description and icon.
3. Create an app bot user for the app.
4. Uncheck "Public Bot" under the app bot user if you don't want anyone else inviting your bot to the server.
5. Take note of the app bot user's token, which will be used in the bot's config.

Next, copy `.env.example` into a new `.env` file.

```bash
$ cp .env.example .env
```

The following fields in the `.env` file can be modified:

- `NODE_ENV`: Defaults to `development` for a development environment. No need to change this unless you're deploying the bot on a production environment.
- `BOT_TOKEN`: Replace this with your app bot user's token.
- `MONGODB_URI`: Defaults to a local MongoDB instance running on port 27017. Replace this if you use a different configuration.
- `SENTRY_DSN`: Unless you're in a production environment and use Sentry for error logging, this doesn't have to be configured.
- `REDIS_PORT`: Defaults to port 6379 of a local redis-server instance. Replace this if you have a different configuration.

Next, you will have to edit `src/config/bot.config.json`.

- `prefix`: Change this if the default prefix conflicts with other bots on your server.
- `game.name`: Modify this if you want to change the bot's status.
- `adminId`: Used for admin-only commands. Change it to your ID.

### Compile and Run

Before starting the bot, make sure MongoDB is running. The bot will attempt to connect to the address specified by `dbConnectionUrl` in the config file.

Next, make sure a local Redis server instance is running. The bot will attempt to connect to the port specified by the `REDIS_PORT` environment variable, or port 6379 by default if none is specified.

Then, you can compile the TypeScript code and start the bot.

```bash
$ npm run build
$ npm start
```

Build tasks are managed and run using [Gulp](https://gulpjs.com/). nodemon is used to run the bot, which will auto-restart the bot when changes are detected in the generated `build` folder.

Instead of running the build and start commands every time you make a change, you can run

```bash
$ npm run watch
```

to let Gulp observe for changes in the `src` folder, compile the source files, and restart the bot automatically.

To invite the bot to your server, generate an invite link at https://discordapi.com/permissions.html. To make things easy, just give the bot the Administrator permission so it automatically has the permission to do everything on your server. You can get your bot's client ID from your Discord Developer App page.

### Debugging

The `npm start` script exposes port 5858 for debugging purposes. The build task also generates map files for the JavaScript files as well, so you can debug from your TypeScript code with a compatible debugger. Visual Studio Code debugging configurations are available for this project, should that be your editor of choice.

## License

The SchedulerBot source code is distributed under the GNU General Public License v3.0.

## Contributing

Refer to the CONTRIBUTING.md file for more information on how to contribute to the development of SchedulerBot.

## Discussions

Discuss about the development of SchedulerBot on the \#development channel of the [SchedulerBot support server](https://discord.gg/CRxRn5X). I usually hang around there.