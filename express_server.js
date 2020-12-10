// REQUIREMENTS
const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
//helper functions
const helpers = require('./helpers');

//SERVER
const PORT = 8080;

// EXPRESS APP SETUP AND MIDDLEWARE 
const app = express();
//setting ejs as the template engine
app.set("view engine", "ejs");
//parse incoming request bodies, data available under req.body
app.use(bodyParser.urlencoded({extended: true}));
//secure cookies middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

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

// APP GETS

// GET LOGIN AND REGISTRATION
app.get("/login", (req, res) => {
  const templateVars = { user: req.session["user_id"] };
  res.render("login_user", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: req.session["user_id"] };
  res.render("register_user", templateVars);
});


// GET URL PAGES
app.get("/urls", (req, res) => {
  if (req.session["user_id"]) {
  const urlList = helpers.urlsForUser(req.session["user_id"]["id"], urlDatabase) 
  const templateVars = { user: req.session["user_id"], urls: urlList };
  res.render("urls_index", templateVars);
  } else {
    const templateVars = { user: null };
    res.render("urls_index", templateVars);
  }
  
  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { user: req.session["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  });
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
  const templateVars = { user: req.session["user_id"]};
  res.render("urls_new", templateVars);
  } else {
    const templateVars = { user: null };
    res.render("urls_index", templateVars)
  };
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.user_id]["longURL"];
  res.redirect(longURL);
});

// DATABASE VIEWER
app.get("/urls-data", (req, res) => {
  res.json(urlDatabase)
});

app.get("/user-data", (req, res) => {
  res.json(userDatabase)
});

// APP POSTS

// POST LOGIN AND REGISTRATION

app.post(`/login`, (req, res) => {
  const value = (helpers.checkUser("email", req.body["email"], userDatabase));
  let passwordCheck;
  if (!value) {
    res.status(403).send('Status code 403 - User not registered');
  } else {
    passwordCheck = bcrypt.compareSync(req.body["password"], value["password"]);
  }
    if (value && passwordCheck) {
    req.session["user_id"] = value;
    res.redirect(`/urls`);
  } else if (value && !passwordCheck) {
    res.status(403).send('Status code 403 - Password');
  } else {
    res.redirect(`/login`);
  }
});

app.post(`/logout`, (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

app.post(`/register`, (req, res) => {
  if (req.body["email"] === '' || req.body["password"] === '') {
    res.status(400).send('Status code 400');
  } else if (helpers.checkUser("email", req.body["email"], userDatabase)) {
    res.status(400).send('Status code 400');
  } else {
    const user = helpers.createUser(req.body["email"], bcrypt.hashSync(req.body["password"], 10), userDatabase);
    req.session['user_id'] = user;
    res.redirect(`/urls`);
  }
});

// POST URL MAKING, EDITING AND DELETING

app.post("/urls", (req, res) => {
  let shortened = helpers.generateRandomString(6);
  helpers.editItem(urlDatabase, shortened, req.body.longURL, req.session["user_id"]["id"]);
  res.redirect(`urls/${shortened}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session["user_id"]["id"] === urlDatabase[req.params.shortURL]["userID"]) {
    helpers.deleteItem(urlDatabase, req.params.shortURL);
  }
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  if (req.session["user_id"]["id"] === urlDatabase[req.params.id]["userID"]) {
    helpers.editItem(urlDatabase, req.params.id, req.body.longURL, req.session["user_id"]["id"]);
  }
  res.redirect(`/urls/${req.params.id}`);
});

// 404 PAGE bug with, newly generated tinies redirect here rather than to their individual page

// app.get('*', function(req, res){
//   const templateVars = { user: req.session["user_id"]}
//   res.render("404_page", templateVars);
// });


// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`Ready to TINY some URLS on port ${PORT}`);
});