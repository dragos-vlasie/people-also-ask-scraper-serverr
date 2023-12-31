const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 4000;

// Use cors middleware to enable CORS
app.use(cors());

app.get("/scrape", (req, res) => {
  const queriesParam = req.query.queries;

  if (!queriesParam) {
    return res.send("Please provide valid queries in the 'queries' parameter.");
  }

  const queries = queriesParam.split(',').map(query => decodeURIComponent(query.trim()));

  if (queries.length === 0) {
    return res.send("Please provide valid queries in the 'queries' parameter.");
  }

  scrapeLogic(res, queries);
});


app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});