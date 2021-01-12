const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  username: String,
  password: String,
  avatarSmall: String,
  avatarBig: String,
  email: String,
  createdAt: String
});

module.exports = model('User', userSchema);
