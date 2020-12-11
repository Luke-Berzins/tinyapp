//FUNCTIONS

const generateRandomString = (name) => {
  const string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  while (result.length < name) {
    result += string[Math.floor((Math.random() * 61))];
  }
  return result;
};

const deleteItem = (database, key) => {
  delete database[key];
};

//URL DATABASE FUNCTIONS

const editItem = (database, key, long, userInfo) => {
  database[key] = {};
  database[key]["longURL"] = long;
  database[key]["userID"] = userInfo;
};

const urlsForUser = (id, database) => {
  let songTags = {};
  for (let song in database) {
    if (database[song]["userID"] === id) {
      songTags[song] = database[song];
    }
  }
  return songTags;
};

const checkUser = (field, newUser, database) => {
  let value;
  for (let userKnown in database) {
    value = (database[userKnown]);
    if (database[userKnown][field] === newUser) {
      return value;
    }
  }
  return false;
};

//  USER DATABASE FUNCTIONS
const createUser = (name, pass, database) => {
  let key = generateRandomString(8);
  const created = database[key] = {
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