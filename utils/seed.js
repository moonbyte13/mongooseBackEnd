const connection = require('../config/connection');
const { Thought, User } = require('../models');
const userData = require('./usernameData.json');
const thoughtData = require('./thoughtData.json');

findId = async (username) => {
  const user = await findById({ username: username }).exec();
  const uId = user._id;
  return uId;
}

const getRandomUser = async (usernames) => {
  const randomIndex = Math.floor(Math.random() * usernames.length);
  return usernames[randomIndex];
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
    friends.push(potentialFriends[randomIndex]);
  }
  return friends;
}


const getRandomThoughts = async (num, thoughts) => {
  const thisThoughts = [];

  for(let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * thoughts.length);
    for(let j = 0; j < thisThoughts.length; j++) {
      if(thisThoughts[j] !== thoughts[randomIndex]) {
        continue;
      }
    }
    thisThoughts.push(thoughts[randomIndex]);
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

  // Create empty array to hold the Users
  const users = [];
  const allThoughts = [];

  // Loop 20 times -- add users to the Users array
  for (let i = 0; i < userData.length; i++) {
    // Get some random assignment objects using a helper function that we imported from ./data
    const thoughts = await getRandomThoughts(3, [...thoughtData]);
    const username = await getRandomUser([...userData]);
    const friends = await getRandomFriends(3, username, [...userData]);
    const email = `${ username }@example.com`
    const user = { username: username, email: email.toLowerCase(), thoughts: [], friends: []}
    userData.splice(userData.indexOf(username), 1);

    for (let j = 0; j < thoughts.length; j++) {
      allThoughts.push({ 
        thoughtText: thoughts[j],
        username: username,
      });
      user.thoughts.push({ 
        thoughtText: thoughts[j],
        username: username,
      });
    }

    for (let j = 0; j < friends.length; j++) {
      user.friends.push( friends[j] );
    }

    users.push(user);
  }

  // Add Users to the collection and await the results
  await User.collection.insertMany(users);
  await Thought.collection.insertMany(allThoughts);

  // Log out the seed data to indicate what should appear in the database
  console.table(users);
  console.info('Seeding complete! 🌱');
  process.exit(0);
});
