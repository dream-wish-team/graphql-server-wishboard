const wishesResolvers = require('./wishes');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
  Wish: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  },
  Query: {
    ...wishesResolvers.Query
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...wishesResolvers.Mutation,
    ...commentsResolvers.Mutation
  },
  Subscription: {
    ...wishesResolvers.Subscription
  }
};
