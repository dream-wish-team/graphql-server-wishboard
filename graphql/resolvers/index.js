const wishesResolvers = require('./wishes');
const usersResolvers = require('./users');
const commentsResolvers = require('./comments');

module.exports = {
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
