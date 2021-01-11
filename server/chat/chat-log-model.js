var mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var ChatLogSchema = new mongoose.Schema({
  chatId: { type: String },
  uuid: { type: String },
  log: { type: String, required: false },
  created: { type: Date, default: Date.now, required: true }
  
});
module.exports = mongoose.model('ChatLog', ChatLogSchema);