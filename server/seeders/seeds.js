const faker = require('faker');

const db = require('../config/connection');
const { Drug, User } = require('../models');

db.once('open', async () => {
  await Drug.remove({});
  await User.remove({});

  // create user data
  const userData = [];

  for (let i = 0; i < 50; i += 1) {
    const username = faker.internet.userName();
    const email = faker.internet.email(username);
    const password = faker.internet.password();

    userData.push({ username, email, password });
  }

  const createdUsers = await User.collection.insert(userData);

  

  // create drugs
  let createdDrugs = [];
  for (let i = 0; i < 100; i += 1) {
    const drugText = faker.lorem.words(Math.round(Math.random() * 20) + 1);

    const randomUserIndex = Math.floor(Math.random() * createdUsers.ops.length);
    const { username, _id: userId } = createdUsers.ops[randomUserIndex];

    const createdDrug = await Drug.create({ drugText, dosage, freq, username });

    const updatedUser = await User.updateOne(
      { _id: userId },
      { $push: { drugs: createdDrug._id } }
    );

    createdDrugs.push(createdDrug);
  }

  
  console.log('all done!');
  process.exit(0);
});
