const { AuthenticationError, UserInputError } = require('apollo-server');

const Wish = require('../../models/Wish');
const User = require('../../models/User');
const checkAuth = require('../../util/check-auth');

module.exports = {
  Query: {
    async getWishes(_, { name, usernameGuest }) {
      try {
        if (usernameGuest) {
          let wishes = await Wish.find({
            name: { $regex: name, $options: 'i' },
          });
          wishes.forEach((item) => {
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
            item.active = item.active.slice(0, 1);
          });
          return wishes.reverse();
        } else {
          const wishes = await Wish.find({
            name: { $regex: name, $options: 'i' },
          });
          return wishes;
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
    async getInfoUserByName(_, { usernameOwner }, context) {
      const user = checkAuth(context);
      try {
        const wishes = await Wish.find({});
        const userInfo = await User.findOne({
          username: { $regex: usernameOwner, $options: 'i' },
        });
        if (wishes && user) {
          const results = wishes.filter((item) =>
            item.active.find(
              (itemActive) =>
                itemActive.user.username.toString() === usernameOwner.toString()
            )
          );
          results.forEach((item) => {
            item.isLike = !!item.likes.find(
              (like) => like.user.username === user.username
            );
            item.isActive = !!item.active.find(
              (itemActive) =>
                itemActive.user.username === user.username &&
                !itemActive.fulfilled
            );
            item.isFulfilled = !!item.active.find(
              (itemFulfilled) =>
                itemFulfilled.user.username === user.username &&
                itemFulfilled.fulfilled
            );
            item.active = item.active.filter(
              (ac) => ac.user.username.toString() === usernameOwner.toString()
            );
          });

          return {
            wishes: results,
            user: userInfo,
          };
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
        throw new Error('Wish currency must not be empty');
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
      let wishes = await Wish.find({});
      return wishes;
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
              wish.isFulfilled = false;
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
