const mongoose = require('mongoose');

const testSchema = mongoose.Schema({
  text: { type: String, required: true },
  number: { type: Number, required: true },
  sessionid: {type: String, required: true},
  timestamp: {type: Number, required: true},
});

module.exports = mongoose.model('Test', clickSchema);