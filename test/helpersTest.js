const { assert } = require('chai');
const { checkUser, deleteItem, editItem, urlsForUser, createUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "deleteMe" : {
    please : "don't"
  }
};

const testURLs = {
  b6UTxQ: { longURL: "https://www.clubpenguin.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

describe('deleteItem', () => {
  it('should delete a user by key', () => {
    const expectedOutput =  {
      "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
      },
      "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
      }
    };
    deleteItem(testUsers, "deleteMe");
    assert.deepEqual(expectedOutput, testUsers);
  });
});

describe('editItem', () => {
  it('should edit a url by key', () => {
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.clubpenguinPRO.ca", userID: "bob" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
    };
    editItem(testURLs, "b6UTxQ", "https://www.clubpenguinPRO.ca", "bob");
    assert.deepEqual(expectedOutput, testURLs);
  });
});


describe('urlsForUser', () => {
  it('should return urls matching user id', () => {
    const expectedOutput = {
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
    };
    assert.deepEqual(expectedOutput, urlsForUser("aJ48lW", testURLs));
  });
  it('should return {} if no urls matching user id', () => {
    assert.deepEqual({}, urlsForUser("spiderman", testURLs));
  });
});


describe('checkUser', () => {
  it('should return a user with a matching email', () => {
    const expectedOutput = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(expectedOutput, checkUser("email", "user@example.com", testUsers));
  });
  it('should return a user with a matching id', () => {
    const expectedOutput =  {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    };
    assert.deepEqual(expectedOutput, checkUser("id", "user2RandomID", testUsers));
  });
  it('should return a user with a matching password', () => {
    const expectedOutput =  {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk"
    };
    assert.deepEqual(expectedOutput, checkUser("password", "dishwasher-funk", testUsers));
  });
  it('should return false if no matching email', () => {
    const expectedOutput =  false;
    assert.deepEqual(expectedOutput, checkUser("email", "dishwasher-funk", testUsers));
  });
});

describe('createUser', () => {
  it('should return a user with a matching password (test relies on functional checkUser)', () => {
    const expectedOutput =  {
      "userRandomID": {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur"
      },
      "user2RandomID": {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk"
      }
    };
    let test = createUser("iLikeTurtles@yahoo.ca", "jimmy", expectedOutput);
    assert.deepEqual(test, checkUser("email","iLikeTurtles@yahoo.ca" , expectedOutput));
  });
});





