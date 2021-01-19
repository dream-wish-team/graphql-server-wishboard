const { model, Schema } = require('mongoose');

const wishSchema = new Schema({
  name: String,
  createdAt: String,
  price: {
    value: Number,
    currency: String,
  },
  creator: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    username: String,
    avatar: {
      small: String,
      normal: String,
    },
  },
  description: String,
  image: {
    small: String,
    normal: String,
  },
  backgroundColor: String,
  visibilty: String,
  originURL: String,
  tags: [String],
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
      creator: {
        id: {
          type: Schema.Types.ObjectId,
          ref: 'users',
        },
        username: String,
        avatar: {
          small: String,
          normal: String,
        },
      },
    },
  ],
});

module.exports = model('Wish', wishSchema);
