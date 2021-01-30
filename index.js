const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const validateTokensMiddleware = require('./graphql/middleware/validate-tokens-middleware');
const { MONGODB } = require('./config.js');

const PORT = process.env.PORT || 5000;

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res }),
  cors: false,
});

const whitelist = [
  'https://test-server-skaymant.netlify.app/',
  'http://localhost:8080',
  'https://dream-team-wishboard.netlify.app/',
];

const whitelistProduction = [
  'https://test-server-skaymant.netlify.app/',
  'http://localhost:8080',
  'https://dream-team-wishboard.netlify.app/',
];

const corsConfig =
  process.env.NODE_ENV !== 'production'
    ? {
        origin: (origin, callback) => {
          if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(null, true);
          }
        },
        credentials: true,
      }
    : {
        origin: (origin, callback) => {
          if (whitelistProduction.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(null, true);
          }
        },
        credentials: true,
      };
const app = express();
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(validateTokensMiddleware);
apolloServer.applyMiddleware({ app, cors: false });

mongoose
  .connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected');
    return app.listen({ port: PORT });
  })
  .then((res) => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  })
  .catch((err) => {
    console.error(err);
  });
