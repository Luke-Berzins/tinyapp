const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));



app.get(`/`, (require, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (require, response) => {
  response.json(urlDatabase);
})

app.get("/hello", (require, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/urls", (require, response) => {
  const templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);

  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[`${req.params.shortURL}`] };
    res.render("urls_show", templateVars);
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});