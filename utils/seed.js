const connection = require('../config/connection');
const { Thought, Reaction } = require('../models/Thought');
const { User } = require('../models');
const { Types: { ObjectId } } = require('mongoose');
const userData = require('./usernameData.json');
const thoughtData = require('./thoughtData.json');
const responseData = require('./responseData.json');

async function getRandomResponse(num, res) {
  const rspns = []
  for (let i = 0; i < num; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * res.length);
    } while (rspns.includes(res[randomIndex]));
    rspns.push(res[randomIndex]);
  }
  return rspns;
}

async function getRandomUser() {
  const allUsers = await User.find({});
  const randomIndex = Math.floor(Math.random() * allUsers.length);
  return allUsers[randomIndex].username;
}

async function getRandomFriends(num, username, usrFriends) {
  const potentialFriends = usrFriends.filter(friend => friend !== username);
  if (potentialFriends.length === 0) {
    throw new Error('There are no potential friends to choose from!');
  }

  const friends = [];
  for (let i = 0; i < num; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * potentialFriends.length);
    } while (friends.includes(potentialFriends[randomIndex]));
    const friendID = await User.findOne({ username: potentialFriends[randomIndex] }, '_id').exec();
    friends.push(friendID);
  }
  return friends;
}

async function getRandomThoughts(num, thoughts, username) {
  const thisThoughts = [];

  for (let i = 0; i < num; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * thoughts.length);
    } while (thisThoughts.includes(thoughts[randomIndex]));
    const thought = await Thought.create({
      thoughtText: thoughts[randomIndex],
      username: username,
    });
    const numResponses = Math.floor(Math.random() * 6);
    const responses = await getRandomResponse(numResponses, [...responseData]);
    const reactions = responses.map(async response => {
      return {
        id: new ObjectId(),
        reactionBody: response,
        username: await getRandomUser(),
      }
    });
    thought.reactions = await Promise.all(reactions);
    await thought.save();
    thisThoughts.push(thought);
  }

  return thisThoughts;
}

async function seed() {
  try {

    console.log('connected');

    await Promise.all([
      Thought.deleteMany({}),
      User.deleteMany({}),
    ]);

    for (const username of userData) {
      const user = await User.create({
        username,
        email: `${username}@example.com`,
      });
      const thoughts = await getRandomThoughts(3, [...thoughtData], username);
      for (const thought of thoughts) {
        thought.username = user.username;
        await thought.save();
      }
      const friends = await getRandomFriends(3, username, [...userData]);
      for (const friend of friends) {
        await user.addFriend(friend);
      }
    }

    const allThoughts = await Thought.find({});
    for (const thought of allThoughts) {
      const numReactions = Math.floor(Math.random() * 6);
      const reactions = await getRandomResponse(numReactions, [...responseData]);
      thought.reactions = {
        id: thought._id,
        reactions: await Promise.all(reactions.map(async reaction => ({
          id: new ObjectId(),
          reactionBody: reaction,
          username: await getRandomUser(),
          })))
};
    await thought.save();
  }
    console.log('Seed data successfully added!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
          

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
  seed();
});
          
          // In this code, a seed function is defined that populates a MongoDB database with random data. It creates users with random thoughts and friends, as well as random reactions for each thought.
          
          // The getRandomResponse function selects a random number of responses from a provided array without repeating any of them.
          
          // The getRandomUser function selects a random user from the User collection in the MongoDB database.
          
          // The getRandomFriends function selects a random number of friends for a given user by filtering out the user's own username from a list of all user data.
          
          // The getRandomThoughts function creates a given number of thoughts for a given user by selecting random thoughts from a list of pre-defined thoughts and creating reactions for each thought.
          
          // The seed function connects to the database, deletes any existing data, and populates the database with new data by creating users with thoughts and friends, as well as reactions for each thought. It also updates the thoughts collection with the reactions created for each thought. Finally, it logs a success message and exits the process.