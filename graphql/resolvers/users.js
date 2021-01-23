const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const {
  validateRegisterInput,
  validateLoginInput,
} = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');
const Wish = require('../../models/Wish');
const checkAuth = require('../../util/check-auth');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

module.exports = {
  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = 'User not found';
        throw new UserInputError('User not found', { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = 'Wrong crendetials';
        throw new UserInputError('Wrong crendetials', { errors });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError('Errors', { errors });
      }
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken',
          },
        });
      }
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        avatar: {
          small: '',
          normal: '',
        },
        password,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
    async updateUser(
      _,
      {
        small,
        normal,
        name,
        surname,
        patronymic,
        dateOfBirth,
        hideDate,
        hideYear,
        facebok,
        vk,
        odnoklassniki,
      },
      context
    ) {
      const { id } = checkAuth(context);
      const user = await User.findById(id);

      if (user) {
        if (small) {
          user.avatar.small = small;
        }
        if (normal) {
          user.avatar.normal = normal;
        }
        if (name) {
          user.personalData.name = name;
        }
        if (surname) {
          user.personalData.surname = surname;
        }
        if (patronymic) {
          user.personalData.patronymic = patronymic;
        }
        if (dateOfBirth) {
          user.personalData.dateOfBirth = dateOfBirth;
        }
        if (hideYear !== null) {
          user.personalData.hideDate = hideDate;
        }
        if (hideYear !== null) {
          user.personalData.hideYear = hideYear;
        }
        if (facebok) {
          user.socialNetworks.facebok = facebok;
        }
        if (vk) {
          user.socialNetworks.vk = vk;
        }
        if (odnoklassniki) {
          user.socialNetworks.odnoklassniki = odnoklassniki;
        }
        await user.save();
        return user;
      } else throw new UserInputError('User not found');
    },
  },
};
