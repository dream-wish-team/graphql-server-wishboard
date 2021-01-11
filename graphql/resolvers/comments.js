const { AuthenticationError, UserInputError } = require('apollo-server');

const checkAuth = require('../../util/check-auth');
const Wish = require('../../models/Wish');

module.exports = {
  Mutation: {
    createComment: async (_, { wishId, body }, context) => {
      const { username } = checkAuth(context);
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not empty',
          },
        });
      }

      const wish = await Wish.findById(wishId);

      if (wish) {
        wish.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await wish.save();
        return wish;
      } else throw new UserInputError('Wish not found');
    },
    async deleteComment(_, { wishId, commentId }, context) {
      const { username } = checkAuth(context);

      const wish = await Wish.findById(wishId);

      if (wish) {
        const commentIndex = wish.comments.findIndex((c) => c.id === commentId);

        if (wish.comments[commentIndex].username === username) {
          wish.comments.splice(commentIndex, 1);
          await wish.save();
          return wish;
        } else {
          throw new AuthenticationError('Action not allowed');
        }
      } else {
        throw new UserInputError('Wish not found');
      }
    },
  },
};
