const express = require('express');
const app = express();
const PORT = 8080;

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
}


app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));




app.get(`/`, (require, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (require, response) => {
  response.json(urlDatabase);
});

app.get("/hello", (require, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (require, response) => {
  const templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});