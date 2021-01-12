const { gql } = require('apollo-server');

module.exports = gql`
  type Wish {
    id: ID!
    name: String!
    createdAt: String!
    creator: TCreator!
    price: Price!
    image: Image!
    backgroundColor: String!
    active: [Active]!
    fulfilled: [Fulfilled]!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
    activeCount: Int!
    fulfilledCount: Int!
  }

  type TCreator {
    id: ID!
    username: String!
    avatarSmall: String!
  }

  type Price {
    value: String!
    currency: String!
  }
  type Image {
    small: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    username: String!
  }
  type Active {
    id: ID!
    createdAt: String!
    username: String!
  }
  type Fulfilled {
    id: ID!
    createdAt: String!
    username: String!
  }
  type Comment {
    id: ID!
    createdAt: String!
    username: String!
    body: String!
  }
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    avatarSmall: String!
    avatarBig: String!
    createdAt: String!
  }
  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }
  type Query {
    getWishes: [Wish]
    getWish(wishId: ID!): Wish
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    createWish(
      name: String!
      price: String!
      currency: String!
      backgroundColor: String!
      image: String!
    ): Wish!
    deleteWish(wishId: ID!): String!
    createComment(wishId: ID!, body: String!): Wish!
    deleteComment(wishId: ID!, commentId: ID!): Wish!
    likeWish(wishId: ID!): Wish!
  }
  type Subscription {
    newWish: Wish!
  }
`;
