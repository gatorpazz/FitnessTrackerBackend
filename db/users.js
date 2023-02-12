const client = require("./client");
const bcrypt = require('bcrypt');
const SALT_COUNT = 10;

async function createUser({ 
  username,
  password 
}) {
  try {
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

    const { rows: [ user ] } = await client.query(`
      INSERT INTO users(username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `, [username, hashedPassword]);

    delete user.password;

    return user;
  } catch (error) {
    console.error(error)
  }
} 

async function getUser({ 
  username,
  password 
}) {
  try{
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;
    
    let passwordsMatch = await bcrypt.compare(password, hashedPassword) 
      if (passwordsMatch) {
        delete user.password;
        return user;
      } else {
        return false;
    }
  } catch (error) {
    console.error(error)
  }
}

async function getUserById(userId) {
  try{
    const { rows: [ user ] } = await client.query(`
      SELECT id, username
      FROM users
      WHERE id=${ userId };
    `);

    if (!user) {
      return null;
    } 

    return user;
  } catch (error) {
    console.error(error)
  }
}

async function getUserByUsername(username) {
  try{
    const { rows: [user] } = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [username]);

    return user;
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}