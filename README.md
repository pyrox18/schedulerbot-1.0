# SchedulerBot

A Discord bot for scheduling events. Currently in development.

This bot uses the [Eris](https://abal.moe/Eris/) library. Reference documentation can be found at https://abal.moe/Eris/docs.

## Installation

Make sure you have set up SSH on GitLab. Then:

```bash
$ git clone git@gitlab.com:<your username here>/scheduler-discord.git
$ cd scheduler-discord
$ npm install
```

## Usage

Before running the bot, you will have to create a Discord Developer App at https://discordapp.com/developers/applications/me.

1. Create a new app by clicking on 'New App'.
2. Give it a name (e.g. "SchedulerBot Pyrox"), description and icon.
3. Create an app bot user for the app.
4. Uncheck "Public Bot" under the app bot user if you don't want anyone else inviting your bot to the server.
5. Take note of the app bot user's token, which will be used in the bot's config.

Next, create a `config` folder in the root, and a `bot.js` file inside it. This will be the configuration that you will pass to the bot. Copy the following into the `bot.js` file.

```javascript
module.exports = {
  botToken: "copyAndPasteYourEntireAppBotUserTokenHere", // Replace the string with your token
  calendarJsonFile: './data/calendars.json', // No need to touch this
  prefix: '+' // You can change this to something else to not conflict with other bots in your server
}
```

Finally, create a `data` folder in the root, and a `calendars.json` file inside it. The contents of the file should just be an empty array:

```json
[]
```

Then, you can start the bot.

```bash
$ npm start
```

nodemon is used to run the bot, which will auto-restart the bot when changes are made to the project files.

To invite the bot to your server, generate an invite link at https://discordapi.com/permissions.html. To make things easy, just give the bot the Administrator permission so it automatically has the permission to do everything on your server. You can get your bot's client ID from your Discord Developer App page.

## Collaborating

Ideas for this project are tracked on a Trello board. Click [here](https://trello.com/invite/b/rHxsRYxW/908ddea37aa6122f15dcfa803c7cdc2a/schedulerbot) to get an invite to the board.