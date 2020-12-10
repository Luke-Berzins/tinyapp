// REQUIREMENTS
const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

//SERVER
const PORT = 8080;

// APP SETUP AND MIDDLEWARE IMPLEMENTATION
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//DATABASES
const userDatabase = { //structure of database
  // {
  // O1qFUflm: { id: 'O1qFUflm', email: 'lukeberzins16@gmail.com',password: 'chocolate_chip' },
  // cwW921dh: { id: 'cwW921dh', email: 'funky-chicken-234@hotmail.com', password: 'pancakes' }
  // }
};

const urlDatabase = { //structure of database
  // b6UTxQ: { longURL: "https://www.clubpenguin.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

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

const urlsForUser = id => { //returns an object with the urlDatabase key-values that match the specified user id
  let songTags = {};
  for (let song in urlDatabase) {
    if (urlDatabase[song]["userID"] === id) {
      songTags[song] = urlDatabase[song];
    }
  }
  return songTags;
};

//  USER DATABASE FUNCTIONS
const createUser = (name, pass) => {
  let key = generateRandomString(8);
  const created = userDatabase[key] = { //add to userDatabase database
    id : key,
    email: name,
    password: pass
  };
  console.log(userDatabase);
  return created; //return the newly created user to use in automatic login after registration
};

const checkUser = (field, newUser) => { //this checks user data against register and login queries
  let value;
  for (let userKnown in userDatabase) {
    value = (userDatabase[userKnown]);
    if (userDatabase[userKnown][field] === newUser) {
      return value; //if they do exist return their info for /login
      //if they do exist give a truthy value for /register
    }
  }
  //if newUser value doesnt exist in userDatabase then return false for /login
  return false; //if newUser value doesnt exist in userDatabase then return false for /register
};

// APP GETS

// GET LOGIN AND REGISTRATION
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
  res.render("login_user", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
  res.render("register_user", templateVars);
});


// GET URL PAGES

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const urlList = urlsForUser(req.cookies["user_id"]["id"]);
    const templateVars = { user: req.cookies["user_id"], urls: urlList };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
  
  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { user: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  });
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = { user: req.cookies["user_id"]};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.user_id]["longURL"];
  res.redirect(longURL);
});

// GET MISC
app.get(`/`, (req, res) => {
  res.send("Hello!");
  // Cookies that have not been signed
  // console.log('Cookies: ', req.cookies);

  // // Cookies that have been signed
  // console.log('Signed Cookies: ', req.signedCookies);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// APP POSTS

// POST LOGIN AND REGISTRATION

app.post(`/login`, (req, res) => {
  const value = (checkUser("email", req.body["email"]));
  const passwordCheck = value["password"] === req.body["password"];
  if (value && passwordCheck) {
    res.cookie("user_id", value);
    res.redirect(`/urls`);
  } else if (!value) {
    res.status(403).send('Status code 403');
  } else if (value && !passwordCheck) {
    res.status(403).send('Status code 403 - Password');
  } else {
    res.redirect(`/login`);
  }
});

app.post(`/logout`, (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.post(`/register`, (req, res) => {
  if (req.body["email"] === '' || req.body["password"] === '') {
    res.status(400).send('Status code 400');
  } else if (checkUser("email", req.body["email"])) {
    res.status(400).send('Status code 400');
  } else {
    const user = (createUser(req.body["email"], req.body["password"]));
    res.cookie("user_id", user);
    res.redirect(`/urls`);
  }
});

// POST URL MAKING, EDITING AND DELETING

app.post("/urls", (req, res) => {
  let shortened = generateRandomString(6);
  editItem(urlDatabase, shortened, req.body.longURL, req.cookies["user_id"]["id"]);
  res.redirect(`urls/${shortened}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"]["id"] === urlDatabase[req.params.shortURL]["userID"]) {
    deleteItem(urlDatabase, req.params.shortURL);
  }
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  editItem(urlDatabase, req.params.id, req.body.longURL, req.cookies["user_id"]["id"]);
  res.redirect(`/urls/${req.params.id}`);
});

// 404 PAGE bug with, newly generated tinies redirect here rather than to their individual page

// app.get('*', function(req, res){
//   const templateVars = { user: req.cookies["user_id"]}
//   res.render("404_page", templateVars);
// });


// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`Ready to TINY some URLS on port ${PORT}`);
});