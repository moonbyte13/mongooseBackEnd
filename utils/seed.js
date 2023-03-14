const connection = require('../config/connection');
const { Thought, Reaction } = require('../models/Thought');
const { User } = require('../models');
// ObjectId() method for converting Id string into an ObjectId for querying database
const { ObjectId } = require('mongoose').Types;
const userData = require('./usernameData.json');
const thoughtData = require('./thoughtData.json');
const responseData = require('./responseData.json');

const getRandomResponse = async (num, res) => {
  const rspns = []
  for (let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * res.length);
    for(let j = 0; j < rspns.length; j++) {
      if(rspns[j] !== res[randomIndex]) {
        break;
      }
    }
    rspns.push(res[randomIndex]);
  }
  return rspns;
}

const getRandomUser = async () => {
  const allUsers = await User.find({});
  console.log('ln 23', allUsers);
  const randomIndex = Math.floor(Math.random() * allUsers.length);
  return allUsers[randomIndex].username;
}

const getRandomFriends = async (num, username, usrFriends) => {
  const potentialFriends = usrFriends.filter((friend) => friend !== username);
  potentialFriends.splice(potentialFriends.indexOf(username), 1);

  if(potentialFriends.length === 0) {
    throw new Error('There are no potential friends to choose from!');
  }

  const friends = [];

  for (let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * potentialFriends.length);
    for(let j = 0; j < friends.length; j++) {
      if(friends[j] !== potentialFriends[randomIndex]) {
        continue;
      }
    }
    const friendID = await User.findOne({username: potentialFriends[randomIndex]}, '_id').exec();
    friends.push(friendID);
  }
  return friends;
}

const getRandomThoughts = async (num, thoughts, username) => {
  const thisThoughts = [];

  for(let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * thoughts.length);
    for(let j = 0; j < thisThoughts.length; j++) {
      if(thisThoughts[j] !== thoughts[randomIndex]) {
        continue;
      }
    }
    const thought = await Thought.create({
      thoughtText: thoughts[randomIndex],
      username: username,
    });
    const responses = await getRandomResponse(Math.floor(Math.random() * 6), [...responseData]);
    const reactions = responses.map(async response => {
      return {
        id: new ObjectId(),
        reactionBody: response,
        username: await getRandomUser(),
      }
    });
    thought.reactions = reactions;
    await thought.save();
    thisThoughts.push(thought);
  }

  return thisThoughts;
}

connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');
  
  // Drop existing thoughts
  await Thought.deleteMany({});

  // Drop existing users
  await User.deleteMany({});

  // Add users to the Users array
  for (let i = 0; i < userData.length; i++) {
    const username = userData[i];
    const user = await User.create({ 
      username: username, 
      email: `${ username }@example.com`,
    });
    const thoughts = await getRandomThoughts(3, [...thoughtData], username);
    for (let j = 0; j < thoughts.length; j++) {
      thoughts[j].username = user.username;
      await thoughts[j].save();
    }
    const friends = await getRandomFriends(3, username, [...userData]);
    for (let j = 0; j < friends.length; j++) {
      user.addFriend(friends[j]);
    }
    }
    
    // Add reactions to random thoughts
    const allThoughts = await Thought.find({});
    for(let i = 0; i < allThoughts.length; i++) {
    const numReactions = Math.floor(Math.random() * 6);
    const reactions = await getRandomResponse(numReactions, [...responseData]);
    const id = await Thought.findOne({ thoughtText: allThoughts[i].thoughtText }, '_id').exec();
    allThoughts[i].reactions = { id, reactions };
    await allThoughts[i].save();
    }
    
    // Add random friends to each user
    const allUsers = await User.find({});
    for(let i = 0; i < allUsers.length; i++) {
    const user = allUsers[i];
    const numFriends = Math.floor(Math.random() * 3);
    const friends = await getRandomFriends(numFriends, user.username, [...userData]);
    for(let j = 0; j < friends.length; j++) {
    user.addFriend(friends[j]);
    }
    }
    
    console.log('finished seeding data');
    process.exit(0);
});
    
    module.exports = { getRandomResponse, getRandomUser, getRandomFriends, getRandomThoughts };
