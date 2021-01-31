const wishesResolvers = require('./wishes');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');
const friendsResolvers = require('./friends');

module.exports = {
  Active: {
    commentCount: (parent) => parent.comments.length,
  },
  Query: {
    ...wishesResolvers.Query,
    ...usersResolvers.Query,
    ...friendsResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...wishesResolvers.Mutation,
    ...commentsResolvers.Mutation,
    ...friendsResolvers.Mutation,
  },
  Subscription: {
    ...wishesResolvers.Subscription,
  },
};
