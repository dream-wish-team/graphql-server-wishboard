const { AuthenticationError, UserInputError } = require('apollo-server');

const Wish = require('../../models/Wish');
const User = require('../../models/User');
const checkAuth = require('../../util/check-auth');

module.exports = {
  Query: {
    async getWishes(_, { name, usernameGuest }) {
      try {
        if (usernameGuest) {
          let wishs = await Wish.find({
            name: { $regex: name, $options: 'i' },
          });
          wishs.forEach((item) => {
            item.isLike = !!item.likes.find(
              (like) => like.user.username === usernameGuest
            );
            item.isActive = !!item.active.find(
              (itemActive) =>
                itemActive.user.username === usernameGuest &&
                !itemActive.fulfilled
            );
            item.isFulfilled = !!item.active.find(
              (itemFulfilled) =>
                itemFulfilled.user.username === usernameGuest &&
                itemFulfilled.fulfilled
            );
          });
          return wishs;
        } else {
          const wishs = await Wish.find({
            name: { $regex: name, $options: 'i' },
          });
          return wishs;
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getWish(_, { wishId, usernameOwner, usernameGuest }) {
      try {
        const wish = await Wish.findById(wishId);
        if (wish) {
          if (usernameGuest) {
            wish.isLike = !!wish.likes.find(
              (like) => like.user.username === usernameGuest
            );
            wish.isActive = !!wish.active.find(
              (itemActive) =>
                itemActive.user.username === usernameGuest &&
                !itemActive.fulfilled
            );
            wish.isFulfilled = !!wish.active.find(
              (itemFulfilled) =>
                itemFulfilled.user.username === usernameGuest &&
                itemFulfilled.fulfilled
            );
            wish.active = wish.active.filter(
              (item) =>
                item.user.username.toString() === usernameOwner.toString()
            );
            return wish;
          } else {
            wish.active = wish.active.filter(
              (item) =>
                item.user.username.toString() === usernameOwner.toString()
            );
            return wish;
          }
        } else {
          throw new Error('Wish not found');
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    async getWishByUserName(_, { usernameOwner }, context) {
      try {
        const wishs = await Wish.find({});
        const user = checkAuth(context);
        if (wishs && user) {
          const result = wishs.filter((item) =>
            item.active.find(
              (itemActive) =>
                itemActive.user.username.toString() === usernameOwner.toString()
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
        likeCount: 0,
        activeCount: 1,
        fulfilledCount: 0,
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
          wish.likeCount = wish.likeCount - 1;
          wish.isLike = false;
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
          wish.likeCount = wish.likeCount + 1;
          wish.isLike = true;
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
            wish.visibility = visibility;
            wish.active[activeIndex].fulfilled = false;
            wish.fulfilledCount = wish.fulfilledCount - 1;
            wish.activeCount = wish.activeCount + 1;
            wish.isActive = true;
            wish.isFulfilled = false;
          } else {
            const bufActive = wish.active.filter(
              (item) => item.user.username !== user.username
            );
            if (bufActive.length !== 0) {
              wish.visibility = visibility;
              wish.active = bufActive;
              wish.activeCount = wish.activeCount - 1;
              wish.isActive = false;
              wish.isFulfilled = true;
            } else {
              wish.isActive = true;
              wish.isFulfilled = false;
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
          wish.activeCount = wish.activeCount + 1;
          wish.isActive = true;
          wish.isFulfilled = false;
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
            wish.visibility = visibility;
            wish.active[activeIndex].fulfilled = false;
            wish.fulfilledCount = wish.fulfilledCount - 1;
            wish.activeCount = wish.activeCount + 1;
            wish.isActive = true;
            wish.isFulfilled = false;
          } else {
            wish.active[activeIndex].fulfilled = true;
            wish.visibility = visibility;
            wish.fulfilledCount = wish.fulfilledCount + 1;
            wish.activeCount = wish.activeCount - 1;
            wish.isActive = false;
            wish.isFulfilled = true;
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
          wish.fulfilledCount = wish.fulfilledCount + 1;
          wish.isFulfilled = true;
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
