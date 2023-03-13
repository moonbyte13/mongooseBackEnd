const connection = require('../config/connection');
const { Thought, User } = require('../models');
const us = require('./usernameData.json');
const thoughts = require('./thoughtData.json');
const usernames = us.map((user) => user.username);

async function getRandomUser() {
  const randomIndex = Math.floor(Math.random() * usernames.length);
  usernames.pop(randomIndex);
  return usernames[randomIndex];
}

async function getRandomThoughts(num) {
  for(let i = 0; i < num; i++) {
    const randomIndex = Math.floor(Math.random() * thoughts.length);
    thoughts.pop(randomIndex);
    return thoughts[randomIndex];
  }
}


connection.on('error', (err) => err);

connection.once('open', async () => {
  console.log('connected');

  // Drop existing courses
  await Course.deleteMany({});

  // Drop existing Users
  await User.deleteMany({});

  // Create empty array to hold the Users
  const users = [];

  // Loop 20 times -- add users to the Users array
  for (let i = 0; i < 20; i++) {
    // Get some random assignment objects using a helper function that we imported from ./data
    const thoughts = getRandomThoughts(2);

    const username = getRandomUser();
    const email = `${ username }@example.com`.toLowerCase();

    users.push({
      username,
      email,
      thoughts: [...thoughts],
      friends: [],
    });
  }

  // Add Users to the collection and await the results
  await User.collection.insertMany(users);

  // Add courses to the collection and await the results
  await Thought.collection.insertOne({
    courseName: 'This is hard!',
    inPerson: false,
    users: [...users],
  });

  // Log out the seed data to indicate what should appear in the database
  console.table(users);
  console.info('Seeding complete! 🌱');
  process.exit(0);
});
