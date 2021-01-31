const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
  tokenCount: Number,
  avatar: {
    small: String,
    normal: String,
  },
  personalData: {
    name: String,
    surname: String,
    patronymic: String,
    dateOfBirth: String,
    hideDate: Boolean,
    hideYear: Boolean,
  },
  socialNetworks: {
    facebook: String,
    vk: String,
    odnoklassniki: String,
  },
  connectionsLists: {
    friends: [
      {
        username: String,
        birthday: String,
        avatar: {
          small: String,
          normal: String,
        },
      },
    ],
    subscriptions: [
      {
        username: String,
        birthday: String,
        avatar: {
          small: String,
          normal: String,
        },
      },
    ],
    subscribers: [
      {
        username: String,
        birthday: String,
        avatar: {
          small: String,
          normal: String,
        },
      },
    ],
  },
  userWishes: {
    reserved: [
      {
        wish: {
          type: Schema.Types.ObjectId,
          ref: 'wishes',
        },
        user: {
          type: Schema.Types.ObjectId,
          ref: 'users',
        },
      },
    ],
  },
  collections: {
    gifts: {
      type: Schema.Types.ObjectId,
      ref: 'wishes',
    },
    birthday: {
      type: Schema.Types.ObjectId,
      ref: 'wishes',
    },
  },
});

module.exports = model('User', userSchema);
