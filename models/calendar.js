class Calendar {
  constructor(guildId, timezone) {
    this.guildId = guildId;
    this.timezone = timezone;
    this.events = [];
  }
}

module.exports = Calendar;