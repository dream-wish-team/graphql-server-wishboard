const { gql } = require('apollo-server');

module.exports = gql`
  type Wish {
    id: ID!
    name: String!
    price: Price!
    image: Image!
    description: String!
    backgroundColor: String!
    tags: [String!]
    originURL: String!
    active: [Active]!
    likes: [Like]!
    likeCount: Int!
    activeCount: Int!
    fulfilledCount: Int!
  }

  type TUser {
    id: ID!
    username: String!
    avatar: Avatar
  }

  type Price {
    value: String!
    currency: String!
  }
  type Image {
    small: String!
    normal: String!
  }
  type Like {
    id: ID!
    createdAt: String!
    user: TUser!
  }
  type Active {
    id: ID!
    createdAt: String!
    visibility: String!
    fulfilled: Boolean!
    user: TUser!
    comments: [Comment]!
    commentCount: Int!
  }
  type Comment {
    id: ID!
    createdAt: String!
    body: String!
    user: TUser!
  }
  type User {
    id: ID!
    email: String!
    token: String!
    username: String!
    avatar: Avatar
    createdAt: String!
    personalData: PersonalData
    socialNetworks: SocialNetworks
    connectionsLists: ConnectionsLists
    userWishes: UserWishes
  }
  type Avatar {
    small: String
    normal: String
  }
  type PersonalData {
    name: String
    surname: String
    patronymic: String
    dateOfBirth: String
    hideDate: Boolean
    hideYear: Boolean
  }
  type SocialNetworks {
    facebok: String
    vk: String
    odnoklassniki: String
  }
  type ConnectionsLists {
    friends: [ID]
    subscriptions: [ID]
    subscribers: [ID]
  }
  type UserWishes {
    reserved: [Reserved]
  }
  type Reserved {
    wish: ID
    user: ID
  }
  input RegisterInput {
    username: String
    password: String
    confirmPassword: String
    email: String
  }
  type Query {
    getWishes(name: String): [Wish]
    getWish(wishId: ID!, username: String!): Wish
    getInfoUserByName(username: String!): User
    getWishByUserName(username: String!): [Wish]
  }
  type Mutation {
    register(registerInput: RegisterInput): User!
    login(username: String!, password: String!): User!
    updateUser(
      small: String
      normal: String
      name: String
      surname: String
      patronymic: String
      dateOfBirth: String
      hideDate: Boolean
      hideYear: Boolean
      facebok: String
      vk: String
      odnoklassniki: String
    ): User!
    createWish(
      name: String!
      price: String!
      originURL: String
      description: String
      visibility: String
      currency: String!
      backgroundColor: String!
      image: String!
    ): Wish!
    deleteWish(wishId: ID!): String!
    createComment(wishId: ID!, username: String!, body: String!): Wish!
    deleteComment(wishId: ID!, username: String!, commentId: ID!): Wish!
    likeWish(wishId: ID!): Wish!
    activeWish(wishId: ID!, visibility: String): Wish!
    fulfilledWish(wishId: ID!, visibility: String): Wish!
  }
  type Subscription {
    newWish: Wish!
  }
`;
