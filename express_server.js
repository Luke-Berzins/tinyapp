const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2" : "http://www.lighthouselabs.cd",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs")

app.get(`/`, (require, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (require, response) => {
  response.json(urlDatabase);
})

app.get("/hello", (require, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (require, response) => {
  const templateVars = { urls: urlDatabase };
  response.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});