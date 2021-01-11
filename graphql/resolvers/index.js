const wishsResolvers = require('./wishs');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
  Wish: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length
  },
  Query: {
    ...wishsResolvers.Query
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...wishsResolvers.Mutation,
    ...commentsResolvers.Mutation
  },
  Subscription: {
    ...wishsResolvers.Subscription
  }
};
