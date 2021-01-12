const { model, Schema } = require('mongoose');

const wishSchema = new Schema({
  name: String,
  createdAt: String,
  username: String,
  price: {
    value: Number,
    currency: String,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  image: {
    small: String,
  },
  backgroundColor: String,
  likes: [
    {
      username: String,
      createdAt: String,
    },
  ],
  active: [
    {
      username: String,
      createdAt: String,
    },
  ],
  fulfilled: [
    {
      username: String,
      createdAt: String,
    },
  ],
  comments: [
    {
      body: String,
      username: String,
      createdAt: String,
    },
  ],
});

module.exports = model('Wish', wishSchema);
