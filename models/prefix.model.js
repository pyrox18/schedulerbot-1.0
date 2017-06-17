const mongoose = require('mongoose');

let prefixSchema = mongoose.Schema({
  guildId: String,
  prefix: String
});

prefixSchema.statics.findByGuildId = function(guildId, callback) {
  return this.findOne({ guildId: guildId }, callback);
}

prefixSchema.methods.updatePrefix = function(prefix, callback) {
  this.prefix = prefix;
  this.save(callback);
}

module.exports = mongoose.model('Prefix', prefixSchema);