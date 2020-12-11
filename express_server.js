// REQUIREMENTS
const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
//helper functions
const helpers = require('./helpers');
// deconstuct helpers
const generateRandomString = helpers.generateRandomString;
const deleteItem = helpers.deleteItem;
const editItem = helpers.editItem;
const urlsForUser = helpers.urlsForUser;
const checkUser = helpers.checkUser;
const createUser = helpers.createUser;

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
}));

//DATABASES
const userDatabase = { //structure of database
  // O1qFUflm: { id: 'O1qFUflm', email: 'lukeberzins16@gmail.com', password: 'chocolate_chip' },
  // cwW921dh: { id: 'cwW921dh', email: 'funky-chicken-234@hotmail.com', password: 'pancakes' }
};

const urlDatabase = { //structure of database
  // b6UTxQ: { longURL: "https://www.clubpenguin.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.clubpenguinPRO.ca", userID: "aJ48lW" }
};

// APP GETS
app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    //filter url database to their links
    const templateVars = { user: req.session["user_id"], urls: urlList };
    const urlList = urlsForUser(req.session["user_id"]["id"], urlDatabase);
    res.render("urls_index", templateVars);
  } else {
    //if not logged in
    const templateVars = { user: req.session["user_id"], error1: null, error2: null };
    res.render("login_user", templateVars);
  }
});

// GET URL PAGES
app.get("/urls", (req, res) => {
  if (req.session["user_id"]) {
    //if user is logged in filter url database to their link
    const urlList = urlsForUser(req.session["user_id"]["id"], urlDatabase);
    const templateVars = { user: req.session["user_id"], urls: urlList };
    res.render("urls_index", templateVars);
  } else {
    //if not logged in
    //user value affects urls_index rendering, needs to be defined even if null
    const templateVars = { user: null };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    const templateVars = { user: req.session["user_id"]};
    res.render("urls_new", templateVars);
  } else {
    const templateVars = { user: req.session["user_id"], error1: null, error2: null };
    res.render("login_user", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  //prevent a user with no cookies from throwing an error for trying to access id property
  if (req.session['user_id'] === undefined) {
    const templateVars = { user: req.session["user_id"] };
    res.render("404_page", templateVars);
  //check if the user's id matches the song, if it does give them the page
  } else if (urlDatabase[req.params.id] && urlDatabase[req.params.id]["userID"] === req.session['user_id']['id']) {
    const templateVars = { user: req.session["user_id"], shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render("urls_show", templateVars);
  } else {
  //if it doesnt give 404
    const templateVars = { user: req.session["user_id"] };
    res.render("404_page", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  //if it doesnt exist give 404
  if (urlDatabase[req.params.id] === undefined) {
    const templateVars = { user: req.session["user_id"] };
    res.render("404_page", templateVars);
  } else {
  //will redirect to targeted page
    const longURL = urlDatabase[req.params.id]["longURL"];
    res.redirect(longURL);
  }
});

// POST URL MAKING, EDITING AND DELETING

app.post("/urls", (req, res) => {
  //makes new url in database
  let shortened = generateRandomString(6);
  editItem(urlDatabase, shortened, req.body.longURL, req.session["user_id"]["id"]);
  res.redirect(`urls/${shortened}`);
});

app.post("/urls/:id/delete", (req, res) => {
  //delete button
  if (req.session["user_id"]["id"] === urlDatabase[req.params.id]["userID"]) {
  //conditional ensures only user can delete their links
    deleteItem(urlDatabase, req.params.id);
  }
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  //edit button
  if (req.session["user_id"]["id"] === urlDatabase[req.params.id]["userID"]) {
  //conditional ensures only user can edit their links
    editItem(urlDatabase, req.params.id, req.body.longURL, req.session["user_id"]["id"]);
  }
  res.redirect(`/urls/${req.params.id}`);
});

// GET LOGIN AND REGISTRATION
app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("urls");
  } else {
    const templateVars = { user: req.session["user_id"], error1: null, error2: null };
    res.render("login_user", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("urls");
  } else {
    const templateVars = { user: req.session["user_id"], error1: null, error2: null };
    res.render("register_user", templateVars);
  }
});

// APP POSTS

// POST LOGIN AND REGISTRATION

app.post(`/login`, (req, res) => {
  //will return an object of the user if it exists
  const value = (checkUser("email", req.body["email"], userDatabase));
  let passwordCheck;
  if (!value) {
    //if user doesnt exist send error
    const templateVars = { user: req.session["user_id"], error1: true, error2: null };
    res.render("login_user", templateVars);
  } else {
    passwordCheck = bcrypt.compareSync(req.body["password"], value["password"]);
  }
  //if username and password match log in
  if (value && passwordCheck) {
    req.session["user_id"] = value;
    res.redirect(`/urls`);
  } else if (value && !passwordCheck) {
  //if user exists and password is incorrect send error
    const templateVars = { user: req.session["user_id"], error1: null, error2: true };
    res.render("login_user", templateVars);
  } else {
    res.redirect(`/login`);
  }
});

app.post(`/register`, (req, res) => {
  if (req.body["email"] === '' || req.body["password"] === '') {
    //if nothing was given send error
    const templateVars = { user: req.session["user_id"], error1: true, error2: null };
    res.render("register_user", templateVars);
  } else if (checkUser("email", req.body["email"], userDatabase)) {
    //if user exists send error
    const templateVars = { user: req.session["user_id"], error1: null, error2: true };
    res.render("register_user", templateVars);
  } else {
    //if new user and password then register in database
    const user = createUser(req.body["email"], bcrypt.hashSync(req.body["password"], 10), userDatabase);
    req.session['user_id'] = user;
    res.redirect(`/urls`);
  }
});

app.post(`/logout`, (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`Ready to TINY some URLS on port ${PORT}`);
});