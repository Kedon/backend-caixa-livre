var mongoose = require('mongoose');
// require('mongoose-double')(mongoose);

var ChatSchema = new mongoose.Schema({  
  username: { type: String, required: [true, 'O nome é um campo obrigatório'] },
  chatId: { type: String },
  uuid: { type: String },
  message: { type: String, required: false },
  created: { type: Date, default: Date.now, required: true }
});
module.exports = mongoose.model('Chat', ChatSchema);