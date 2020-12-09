const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())


const urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  while (result.length < 6) {
    result += string[Math.floor((Math.random() * 61))];
  }
  return result;
};

const deleteTiny = (key) => {
  delete urlDatabase[key];
};

const editTiny = (key, long) => {
  urlDatabase[key] = long;
};



app.get(`/`, (req, res) => {
  res.send("Hello!");
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  });
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  deleteTiny(req.params.shortURL);
  res.redirect(`/urls`);
});

app.post(`/login`, (req, res) => {
  const named = req.body["username"];
  res.cookie( "username", named );
 
  res.redirect(`/urls`);
});
app.post(`/logout`, (req, res) => {
  res.cookie( "username", '' );
  res.redirect(`/urls`);
});


app.post("/urls", (req, res) => {
  for (let key in urlDatabase) {
    if (urlDatabase[key] === req.body.longURL) {
      res.redirect(`urls/${key}`);
      return;
    }
  }
  let shortened = generateRandomString();
  urlDatabase[shortened] = req.body.longURL;
  res.redirect(`urls/${shortened}`); 
});

app.post("/urls/:id/edit", (req, res) => {
  editTiny(req.params.id, req.body.longURL);
  res.redirect(`/urls/${req.params.id}`)
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});