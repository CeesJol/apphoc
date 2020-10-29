require("dotenv").config();

module.exports = {
  env: {
    FAUNADB_SECRET_KEY: process.env.FAUNADB_SECRET_KEY,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    FAUNADB_GRAPHQL_ENDPOINT: "https://graphql.fauna.com/graphql",
    DOMAIN_NAME: "https://apphoc.vercel.app",
    APP_NAME: "Jumpstart Connections",
  },
};
