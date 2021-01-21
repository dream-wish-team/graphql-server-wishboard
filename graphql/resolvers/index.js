const wishesResolvers = require('./wishes');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
  Wish: {
    likeCount: (parent) => parent.likes.length,
    fulfilledCount: (parent) =>
      parent.active.filter((item) => item.fulfilled).length,
    activeCount: (parent) =>
      parent.active.filter((item) => !item.fulfilled).length,
  },
  Active: {
    commentCount: (parent) => parent.comments.length,
  },
  Query: {
    ...wishesResolvers.Query,
    ...usersResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...wishesResolvers.Mutation,
    ...commentsResolvers.Mutation,
  },
  Subscription: {
    ...wishesResolvers.Subscription,
  },
};
