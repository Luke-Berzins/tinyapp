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
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
//secure cookies middleware
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//DATABASES
const userDatabase = {};
const urlDatabase = {};

// APP GETS
app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    //filter url database to user's links
    const urlList = urlsForUser(req.session["user_id"]["id"], urlDatabase);
    const templateVars = { user: req.session["user_id"], urls: urlList };
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
    //login check
    const urlList = urlsForUser(req.session["user_id"]["id"], urlDatabase);
    const templateVars = { user: req.session["user_id"], urls: urlList };
    res.render("urls_index", templateVars);
  } else {
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
  //if user id is undefined or if the user id does not match the urls owner
  if (req.session['user_id'] === undefined || urlDatabase[req.params.id]["userID"] !== req.session['user_id']['id']) {
    const templateVars = { user: req.session["user_id"] };
    res.render("404_page", templateVars);
  } else {
    const templateVars = { user: req.session["user_id"], shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
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
  console.log("urlsdata", urlDatabase);
  res.redirect(`urls/${shortened}`);
});

app.post("/urls/:id/delete", (req, res) => {
  if (req.session["user_id"]["id"] === urlDatabase[req.params.id]["userID"]) {
  //conditional ensures only user can delete their links
    deleteItem(urlDatabase, req.params.id);
  }
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  if (req.session["user_id"]["id"] === urlDatabase[req.params.id]["userID"]) {
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