const { AuthenticationError, UserInputError } = require('apollo-server');

const checkAuth = require('../../util/check-auth');
const Wish = require('../../models/Wish');
const User = require('../../models/User');

module.exports = {
  Mutation: {
    createComment: async (_, { wishId, username, body }, context) => {
      const user = checkAuth(context);
      const infoUser = await User.findById(user.id);
      if (body.trim() === '') {
        throw new UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not empty',
          },
        });
      }
      const wish = await Wish.findById(wishId);
      if (wish) {
        const activeIndex = wish.active.findIndex(
          (item) => item.user.username === username
        );
        if (activeIndex !== -1) {
          wish.active[activeIndex].comments.unshift({
            body,
            createdAt: new Date().getTime(),
            user: {
              id: infoUser.id,
              username: user.username,
              avatar: {
                small: infoUser.avatar.small,
                normal: infoUser.avatar.normal,
              },
            },
          });
        } else throw new UserInputError('Username not found');

        await wish.save();
        return wish;
      } else throw new UserInputError('Wish not found');
    },
    async deleteComment(_, { wishId, username, commentId }, context) {
      const user = checkAuth(context);
      const wish = await Wish.findById(wishId);
      if (wish) {
        const activeIndex = wish.active.findIndex(
          (item) => item.user.username === username
        );
        if (activeIndex !== -1) {
          const commentIndex = wish.active[activeIndex].comments.findIndex(
            (c) => c.id === commentId
          );
          if (
            wish.active[activeIndex].comments[commentIndex].user.username ===
            user.username
          ) {
            wish.active[activeIndex].comments.splice(commentIndex, 1);
            await wish.save();
            return wish;
          } else {
            throw new AuthenticationError('Action not allowed');
          }
        } else {
          throw new UserInputError('Username not found');
        }
      } else {
        throw new UserInputError('Wish not found');
      }
    },
  },
};
