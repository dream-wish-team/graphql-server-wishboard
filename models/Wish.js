const { model, Schema } = require('mongoose');

const wishSchema = new Schema({
  name: String,
  price: {
    value: Number,
    currency: String,
  },
  description: String,
  image: {
    small: String,
    normal: String,
  },
  backgroundColor: String,
  originURL: String,
  tags: [String],
  likes: [
    {
      createdAt: String,
      user: {
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
  active: [
    {
      createdAt: String,
      visibility: String,
      fulfilled: Boolean,
      user: {
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
      comments: [
        {
          body: String,
          createdAt: String,
          user: {
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
    },
  ],
});

module.exports = model('Wish', wishSchema);
