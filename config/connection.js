const { connect, connection, model } = require('mongoose');
const { User, Thought, Reaction } = require('../models');

// After you create your Heroku application, visit https://dashboard.heroku.com/apps/ select the application name and add your Atlas connection string as a Config Var
// Node will look for this environment variable and if it exists, it will use it. Otherwise, it will assume that you are running this application locally
const connectionString =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/socialNetworkDB';

connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection.on('connected', async () => {
  await User.deleteMany({});
  await Thought.deleteMany({});
  await Reaction.deleteMany({});
  console.log(`Mongoose connected to ${connectionString}`);

});

module.exports = connection;
