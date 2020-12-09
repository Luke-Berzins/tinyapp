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
const userDatabase = {
};

const urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//FUNCTIONS

const generateRandomString = (name) => {
  const string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  while (result.length < name) {
    result += string[Math.floor((Math.random() * 61))];
  }
  return result; //not the most elegant but I came up with it myself, so come on, you know?
};

const deleteItem = (database, key) => {
  delete database[key];
};

const editItem = (database, key, long) => {
  database[key] = long;
};

//  USER DATABASE FUNCTIONS
const createUser = (name, pass) => {
  let key = generateRandomString(8);
  const created = userDatabase[key] = { //add to userDatabase database
    id : key,
    email: name,
    password: pass
  };
  return created; //return the newly created user to use in automatic login after registration
};

const userInfoChecker = (field, newUser) => {
  for (let userKnown in userDatabase) {
    if (userDatabase[userKnown][field] === newUser) {
      return true; //If there's a key-value that matches the searched one, (for /register the searched one is the 
    }              // user's requested email), then return true
  }
  return false; //if newUser value doesnt exist in userDatabase then return false
};

// APP GETS

// GET LOGIN AND REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
  res.render("register_user", templateVars);
});

// GET URL PAGES

app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["user_id"]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { user: req.cookies["user_id"], urls: urlDatabase };
  res.render("urls_index", templateVars);

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { user: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  });
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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
  const named = req.body["username"];
  res.cookie("username", named);
  res.redirect(`/urls`);
});
app.post(`/logout`, (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.post(`/register`, (req, res) => {
  if (req.body["email"] === '' || req.body["password"] === '') {
    res.status(400).send('Status code 400');
  } else if (userInfoChecker("email", req.body["email"])) {
    res.status(400).send('Status code 400');
  } else {
    console.log(userDatabase)
    const user = (createUser(req.body["email"], req.body["password"]));
    res.cookie("user_id", user);
    res.redirect(`/urls`);
  }
});

// POST URL MAKING, EDITING AND DELETING

app.post("/urls", (req, res) => {
  for (let key in urlDatabase) {
    if (urlDatabase[key] === req.body.longURL) {
      res.redirect(`urls/${key}`);
      return;
    }
  }
  let shortened = generateRandomString(6);
  editItem(urlDatabase, shortened, req.body.longURL);
  res.redirect(`urls/${shortened}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  deleteItem(urlDatabase, req.params.shortURL);
  res.redirect(`/urls`);
});

app.post("/urls/:id/edit", (req, res) => {
  editItem(urlDatabase, req.params.id, req.body.longURL);
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