// REQUIREMENTS
const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
//helper functions
const helpers = require('./helpers');
const { urlsForUser } = require('./helpers');

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
  // O1qFUflm: { id: 'O1qFUflm', email: 'lukeberzins16@gmail.com',password: 'chocolate_chip' },
  // cwW921dh: { id: 'cwW921dh', email: 'funky-chicken-234@hotmail.com', password: 'pancakes' }
};

const urlDatabase = { //structure of database
  // b6UTxQ: { longURL: "https://www.clubpenguin.ca", userID: "aJ48lW" },
  // i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// APP GETS
app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    const urlList = helpers.urlsForUser(req.session["user_id"]["id"], urlDatabase); //filter url database to their links
    const templateVars = { user: req.session["user_id"], urls: urlList };
    res.render("urls_index", templateVars);
  } else { //if not logged in
    const templateVars = { user: req.session["user_id"], error1: null, error2: null };
    res.render("login_user", templateVars);
  }
});

// GET URL PAGES
app.get("/urls", (req, res) => {
  if (req.session["user_id"]) { //if user is logged in
    const urlList = helpers.urlsForUser(req.session["user_id"]["id"], urlDatabase); //filter url database to their links
    const templateVars = { user: req.session["user_id"], urls: urlList };
    res.render("urls_index", templateVars);
  } else { //if not logged in
    const templateVars = { user: null }; //user value affects urls_index rendering
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) { //accessible only if logged in
    const templateVars = { user: req.session["user_id"]};
    res.render("urls_new", templateVars);
  } else {
    const templateVars = { user: req.session["user_id"], error1: null, error2: null };
    res.render("login_user", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.session['user_id'] === undefined) { //prevent a user with no cookies from throwing an error for trying to access id property
      const templateVars = { user: req.session["user_id"] };
      res.render("404_page", templateVars);
    } else if (urlDatabase[req.params.id] && urlDatabase[req.params.id]["userID"] === req.session['user_id']['id']) {
    const templateVars = { user: req.session["user_id"], shortURL: req.params.id, longURL: urlDatabase[req.params.id]};
    res.render("urls_show", templateVars) //check if the user's id matches the song, if it does give them the page
  } else {
    const templateVars = { user: req.session["user_id"] };
    res.render("404_page", templateVars) //if it give 404
  }
});

app.get("/u/:id", (req, res) => { //will redirect to targeted page
  const longURL = urlDatabase[req.params.id]["longURL"];
  res.redirect(longURL);
});

// POST URL MAKING, EDITING AND DELETING

app.post("/urls", (req, res) => {
  let shortened = helpers.generateRandomString(6);
  helpers.editItem(urlDatabase, shortened, req.body.longURL, req.session["user_id"]["id"]); //makes new url in database
  res.redirect(`urls/${shortened}`);
});

app.post("/urls/:id/delete", (req, res) => { //delete button
  if (req.session["user_id"]["id"] === urlDatabase[req.params.id]["userID"]) { //conditional ensures only user can delete their links
    helpers.deleteItem(urlDatabase, req.params.id);
  }
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => { //edit button
  if (req.session["user_id"]["id"] === urlDatabase[req.params.id]["userID"]) {//conditional ensures only user can edit their links
    helpers.editItem(urlDatabase, req.params.id, req.body.longURL, req.session["user_id"]["id"]);
  }
  res.redirect(`/urls/${req.params.id}`);
});

// GET LOGIN AND REGISTRATION
app.get("/login", (req, res) => { //login page
  if (req.session["user_id"]) {
    res.redirect("urls");
  } else {
    const templateVars = { user: req.session["user_id"], error1: null, error2: null };
    res.render("login_user", templateVars);
  }
});

app.get("/register", (req, res) => { //registration page
  if (req.session["user_id"]) {
    res.redirect("urls");
  } else {
    const templateVars = { user: req.session["user_id"], error1: null, error2: null };
    res.render("register_user", templateVars);
  }
});


// DATABASE VIEWER uncomment to see databases from browswer if you are debugging database interactions
app.get("/urls-data", (req, res) => {
  res.json(urlDatabase)
});

app.get("/user-data", (req, res) => {
  res.json(userDatabase)
});

// APP POSTS

// POST LOGIN AND REGISTRATION

app.post(`/login`, (req, res) => {
  const value = (helpers.checkUser("email", req.body["email"], userDatabase)); //will return an object of the user if it exists
  let passwordCheck; //need to set this or else "if (value && passwordCheck)" will fail without else statement intializing ***
  if (!value) {
    const templateVars = { user: req.session["user_id"], error1: true, error2: null };
    res.render("login_user", templateVars); //if user doesnt exist send error
  } else { // *** this is the else statement the above comment is referring to
    passwordCheck = bcrypt.compareSync(req.body["password"], value["password"]);
  }
  if (value && passwordCheck) { //if username and password match log in
    req.session["user_id"] = value;
    res.redirect(`/urls`);
  } else if (value && !passwordCheck) { //if user exists and password is incorrect send error
    const templateVars = { user: req.session["user_id"], error1: null, error2: true };
    res.render("login_user", templateVars);
  } else {
    res.redirect(`/login`);
  }
});

app.post(`/register`, (req, res) => {
  if (req.body["email"] === '' || req.body["password"] === '') {
    const templateVars = { user: req.session["user_id"], error1: true, error2: null };
    res.render("register_user", templateVars); //if nothing was given send error
  } else if (helpers.checkUser("email", req.body["email"], userDatabase)) {
    const templateVars = { user: req.session["user_id"], error1: null, error2: true };
    res.render("register_user", templateVars); //if user exists send error
  } else {
    const user = helpers.createUser(req.body["email"], bcrypt.hashSync(req.body["password"], 10), userDatabase);
    req.session['user_id'] = user; //if new user and password then register
    res.redirect(`/urls`);
  }
});

app.post(`/logout`, (req, res) => {
  req.session = null; //reset cookies
  res.redirect("/urls");
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