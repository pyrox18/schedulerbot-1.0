module.exports = {
  botToken: "copyAndPasteYourEntireAppBotUserTokenHere", // Replace the string with your token
  prefix: '+', // You can change this to something else to not conflict with other bots in your server
  game: {
    name: "+help | In development" // Change the bot's "Playing" status on Discord; see https://abal.moe/Eris/docs/CommandClient#function-editStatus
  },
  dbConnectionUrl: 'mongodb://localhost:27017/schedulerbot' // URL to connect to MongoDB
}