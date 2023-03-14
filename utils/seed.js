const connection = require('../config/connection');
const { Thought, User } = require('../models');
const userData = require('./usernameData.json');
const thoughtData = require('./thoughtData.json');

const getRandomUser = async (usernames) => {
  const randomIndex = Math.floor(Math.random() * usernames.length);
  return usernames[randomIndex];
}

const getRandomFriends = async (num, username, usrFriends) => {
  const potentialFriends = usrFriends.filter((friend) => friend !== username);
  potentialFriends.splice(potentialFriends.indexOf(username), 1);
  console.log(potentialFriends);

  if(potentialFriends.length === 0) {
    throw new Error('There are no potential friends to choose from!');
  }

  const friends = [];

  for (let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * potentialFriends.length);
    friends.push(potentialFriends[randomIndex]);
  }

  return friends;
}


const getRandomThoughts = async (num, thoughts) => {
  const thisThoughts = [];

  for(let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * thoughts.length);
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

  // Loop 20 times -- add users to the Users array
  for (let i = 0; i < userData.length; i++) {
    // Get some random assignment objects using a helper function that we imported from ./data
    const thoughts = await getRandomThoughts(2, thoughtData);
    const username = await getRandomUser(userData.map(user => user.username));
    const friends = await getRandomFriends(3, username, userData.map(user => user.username));
    const email = `${ username }@example.com`
    
    const user = await User.create({ username, email });

    for (let j = 0; j < thoughts.length; j++) {
      await Thought.create({ thoughtText: thoughts[j], username: user.username });
      user.thoughts.push(thoughts[j]);
    }

    for (let j = 0; j < friends.length; j++) {
      user.friends.push(await User.findOne({ username: friends[j] }));
    }

    users.push(user);
  }

  // Add Users to the collection and await the results
  await User.collection.insertMany(users);


  // NOTE: not sure how to add thoughts to the collection
/*   // Add thoughts to the collection and await the results
  await Thought.collection.insertOne({
    courseName: 'This is hard!',
    inPerson: false,
    users: [...users],
  }); */

  // Log out the seed data to indicate what should appear in the database
  console.table(users);
  console.info('Seeding complete! 🌱');
  process.exit(0);
});
