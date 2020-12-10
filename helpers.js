//FUNCTIONS

const generateRandomString = (name) => {
  const string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  while (result.length < name) {
    result += string[Math.floor((Math.random() * 61))];
  }
  return result; //not the most elegant but who is?
};

const deleteItem = (database, key) => {
  delete database[key];
};

//URL DATABASE FUNCTIONS

const editItem = (database, key, long, userInfo) => { //specific to URL database structure
  database[key] = {longURL: long, userID: userInfo };
};

const urlsForUser = (id, database) => { //returns an object with the urlDatabase key-values that match the specified user id
  let songTags = {};
  for (let song in database) {
    if (database[song]["userID"] === id) {
      songTags[song] = database[song];
    }
  }
  return songTags;
};

const checkUser = (field, newUser, database) => { //this checks user data against register and login queries
  let value;
  for (let userKnown in database) {
    value = (database[userKnown]);
    if (database[userKnown][field] === newUser) {
      return value; //if they do exist return their info for /login
      //if they do exist give a truthy value for /register
    }
  }
  //if newUser value doesnt exist in database then return false for /login
  return false; //if newUser value doesnt exist in database then return false for /register
};

//  USER DATABASE FUNCTIONS
const createUser = (name, pass, database) => { //specific to user database structure
  let key = generateRandomString(8);
  const created = database[key] = { //add to database
    id : key,
    email: name,
    password: pass
  };
  return created; //return the newly created user to use in automatic login after registration
};

module.exports = { generateRandomString,
  deleteItem,
  editItem,
  urlsForUser,
  checkUser,
  createUser };