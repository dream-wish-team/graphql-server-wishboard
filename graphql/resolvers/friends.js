const { AuthenticationError, UserInputError } = require('apollo-server');

const checkAuth = require('../../util/check-auth');
const User = require('../../models/User');

module.exports = {
  Query: {
    async getFriends(_, { name, usernameOwner }, context) {
      const user = checkAuth(context);
      try {
        const userInfo = await User.findOne({
          username: { $regex: usernameOwner, $options: 'i' },
        });
        let friends = userInfo.connectionsLists.friends.filter(
          (item) => item.username.indexOf(name) !== -1
        );
        return friends;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getSubscribers(_, { name, usernameOwner }, context) {
      const user = checkAuth(context);
      try {
        const userInfo = await User.findOne({
          username: { $regex: usernameOwner, $options: 'i' },
        });
        let subscribers = userInfo.connectionsLists.subscribers.filter(
          (item) => item.username.indexOf(name) !== -1
        );
        return subscribers;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getSubscriptions(_, { name, usernameOwner }, context) {
      const user = checkAuth(context);
      try {
        const userInfo = await User.findOne({
          username: { $regex: usernameOwner, $options: 'i' },
        });
        let subscriptions = userInfo.connectionsLists.subscriptions.filter(
          (item) => item.username.indexOf(name) !== -1
        );
        return subscriptions;
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    subscribeUser: async (_, { subscriptionUsername }, context) => {
      const user = checkAuth(context);
      const subscriberUser = await User.findById(user.id);
      const subscriptionUser = await User.findOne({
        username: { $regex: subscriptionUsername, $options: 'i' },
      });
      if (subscriberUser.username !== subscriptionUser.username) {
        const newSubscriberUser = {
          id: subscriberUser.id,
          username: subscriberUser.username,
          birthday: subscriberUser.personalData.dateOfBirth,
          avatar: subscriberUser.avatar,
        };
        const newSubscriptionUser = {
          id: subscriptionUser.id,
          username: subscriptionUser.username,
          birthday: subscriptionUser.personalData.dateOfBirth,
          avatar: subscriptionUser.avatar,
        };

        if (
          subscriptionUser.connectionsLists.friends.find(
            (item) => item.username === subscriberUser.username
          )
        ) {
          subscriptionUser.connectionsLists.subscriptions.push(
            newSubscriberUser
          );
          subscriberUser.connectionsLists.subscribers.push(newSubscriptionUser);
          subscriptionUser.connectionsLists.friends = subscriptionUser.connectionsLists.friends.filter(
            (item) => item.username !== subscriberUser.username
          );
          subscriberUser.connectionsLists.friends = subscriberUser.connectionsLists.friends.filter(
            (item) => item.username !== subscriptionUser.username
          );
        } else if (
          subscriptionUser.connectionsLists.subscriptions.find(
            (item) => item.username === subscriberUser.username
          )
        ) {
          subscriptionUser.connectionsLists.friends.push(newSubscriberUser);
          subscriberUser.connectionsLists.friends.push(newSubscriptionUser);
          subscriptionUser.connectionsLists.subscriptions = subscriptionUser.connectionsLists.subscriptions.filter(
            (item) => item.username !== subscriberUser.username
          );
          subscriberUser.connectionsLists.subscribers = subscriptionUser.connectionsLists.subscribers.filter(
            (item) => item.username !== subscriberUser.username
          );
        } else if (
          subscriptionUser.connectionsLists.subscribers.find(
            (item) => item.username === subscriberUser.username
          )
        ) {
          subscriptionUser.connectionsLists.subscribers = subscriptionUser.connectionsLists.subscribers.filter(
            (item) => item.username !== subscriberUser.username
          );
          subscriberUser.connectionsLists.subscriptions = subscriberUser.connectionsLists.subscriptions.filter(
            (item) => item.username !== subscriptionUser.username
          );
        } else {
          subscriberUser.connectionsLists.subscriptions.push(
            newSubscriptionUser
          );
          subscriptionUser.connectionsLists.subscribers.push(newSubscriberUser);
        }
        await subscriptionUser.save();
        await subscriberUser.save();
        return [subscriptionUser, subscriberUser];
      } else
        throw new UserInputError('SubscriptionUsername === SubscriberUser');
    },
  },
};
