const { model, Schema } = require('mongoose');

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  createdAt: String,
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
    facebok: String,
    vk: String,
    odnoklassniki: String,
  },
  connectionsLists: {
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    subscriptions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    subscribers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
  },
  userWishes: {
    active: [
      {
        type: Schema.Types.ObjectId,
        ref: 'wishes',
      },
    ],
    fulfilled: [
      {
        type: Schema.Types.ObjectId,
        ref: 'wishes',
      },
    ],
    liked: [
      {
        type: Schema.Types.ObjectId,
        ref: 'wishes',
      },
    ],
    created: [
      {
        type: Schema.Types.ObjectId,
        ref: 'wishes',
      },
    ],
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
