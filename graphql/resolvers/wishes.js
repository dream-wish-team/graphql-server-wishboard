const { AuthenticationError, UserInputError } = require('apollo-server');

const Wish = require('../../models/Wish');
const User = require('../../models/User');
const checkAuth = require('../../util/check-auth');

module.exports = {
  Query: {
    async getWishes(_, { name }) {
      try {
        const wishs = await Wish.find({
          name: { $regex: name, $options: 'i' },
        });
        return wishs;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getWish(_, { wishId, username }) {
      try {
        const wish = await Wish.findById(wishId);
        if (wish) {
          wish.active = wish.active.filter(
            (item) => item.user.username.toString() === username.toString()
          );
          return wish;
        } else {
          throw new Error('Wish not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getWishByUserName(_, { username }, context) {
      try {
        const wishs = await Wish.find({});
        const user = checkAuth(context);
        if (wishs && user) {
          const result = wishs.filter((item) =>
            item.active.find(
              (itemActive) =>
                itemActive.user.username.toString() === username.toString()
            )
          );
          return result;
        } else {
          throw new Error('Wish not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createWish(
      _,
      {
        name,
        price,
        currency,
        backgroundColor,
        originURL,
        description,
        visibility,
        image,
      },
      context
    ) {
      const user = checkAuth(context);
      const infoUser = await User.findById(user.id);
      if (name.trim() === '') {
        throw new Error('Wish name must not be empty');
      }
      if (price.trim() === '') {
        throw new Error('Wish price must not be empty');
      }
      if (currency.trim() === '') {
        throw new Error('Wish price must not be empty');
      }
      if (backgroundColor.trim() === '') {
        throw new Error('Wish price must not be empty');
      }
      if (image.trim() === '') {
        throw new Error('Wish image must not be empty');
      }

      const newWish = new Wish({
        name,
        price: {
          value: price,
          currency,
        },
        image: {
          small: image,
          normal: image,
        },
        backgroundColor,
        originURL,
        description,
        active: [
          {
            createdAt: new Date().getTime(),
            fulfilled: false,
            visibility,
            user: {
              id: user.id,
              username: user.username,
              avatar: {
                small: infoUser.avatar.small,
                normal: infoUser.avatar.normal,
              },
            },
          },
        ],
      });
      const wish = await newWish.save();
      context.pubsub.publish('NEW_WISH', {
        newWish: wish,
      });

      return wish;
    },
    async deleteWish(_, { wishId }, context) {
      const user = checkAuth(context);
      try {
        const wish = await Wish.findById(wishId);
        if (user.username === wish.active[0].user.username) {
          await wish.delete();
          return 'Wish deleted successfully';
        } else {
          throw new AuthenticationError('Action not allowed');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async likeWish(_, { wishId }, context) {
      const user = checkAuth(context);
      const infoUser = await User.findById(user.id);
      const wish = await Wish.findById(wishId);
      if (wish) {
        if (wish.likes.find((like) => like.user.username === user.username)) {
          wish.likes = wish.likes.filter(
            (like) => like.user.username !== user.username
          );
        } else {
          wish.likes.push({
            createdAt: new Date().getTime(),
            user: {
              id: user.id,
              username: user.username,
              avatar: {
                small: infoUser.avatar.small,
                normal: infoUser.avatar.normal,
              },
            },
          });
        }

        await wish.save();
        return wish;
      } else throw new UserInputError('Wish not found');
    },
    async activeWish(_, { wishId, visibility }, context) {
      const user = checkAuth(context);
      const infoUser = await User.findById(user.id);
      const wish = await Wish.findById(wishId);
      if (wish) {
        const activeIndex = wish.active.findIndex(
          (item) => item.user.username === user.username
        );
        if (activeIndex !== -1) {
          if (wish.active[activeIndex].fulfilled) {
            wish.active[activeIndex].fulfilled = false;
          } else {
            const bufActive = wish.active.filter(
              (item) => item.user.username !== user.username
            );
            if (bufActive.length !== 0) {
              wish.active = bufActive;
            }
          }
        } else {
          wish.active.push({
            createdAt: new Date().getTime(),
            fulfilled: false,
            visibility,
            user: {
              id: user.id,
              username: user.username,
              avatar: {
                small: infoUser.avatar.small,
                normal: infoUser.avatar.normal,
              },
            },
          });
        }

        await wish.save();
        return wish;
      } else throw new UserInputError('Wish not found');
    },
    async fulfilledWish(_, { wishId, visibility }, context) {
      const user = checkAuth(context);
      const infoUser = await User.findById(user.id);
      const wish = await Wish.findById(wishId);
      if (wish) {
        const activeIndex = wish.active.findIndex(
          (item) => item.user.username === user.username
        );
        if (activeIndex !== -1) {
          if (wish.active[activeIndex].fulfilled) {
            wish.active[activeIndex].fulfilled = false;
          } else {
            wish.active[activeIndex].fulfilled = true;
          }
        } else {
          wish.active.push({
            createdAt: new Date().getTime(),
            fulfilled: true,
            visibility,
            user: {
              id: user.id,
              username: user.username,
              avatar: {
                small: infoUser.avatar.small,
                normal: infoUser.avatar.normal,
              },
            },
          });
        }

        await wish.save();
        return wish;
      } else throw new UserInputError('Wish not found');
    },
  },
  Subscription: {
    newWish: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_WISH'),
    },
  },
};
