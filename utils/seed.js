const connection = require('../config/connection');
const { Thought, User } = require('../models');
const usr = require('./usernameData.json');
const thoughts = require('./thoughtData.json');
const usernames = [...usr];

async function getRandomUser() {
  const randomIndex = Math.floor(Math.random() * usernames.length);
  usernames.splice(randomIndex, 1);
  return usernames[randomIndex];
}

async function getRandomFriends(num, username) {
  const potentialFriends = usr.slice().filter((friend) => friend !== username);
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


async function getRandomThoughts(num) {
  const thisThoughts = []

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
  for (let i = 0; i < 20; i++) {
    // Get some random assignment objects using a helper function that we imported from ./data
    const thoughts = await getRandomThoughts(2);
    const username = await getRandomUser()
    const friends = await getRandomFriends(3, username);
    
    const email = `${ username }@example.com`.toLowerCase();

    users.push({
      username,
      email,
      thoughts: [...thoughts],
      friends: [...friends],
    });
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
