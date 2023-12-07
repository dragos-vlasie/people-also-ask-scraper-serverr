const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res, queries) => {
  
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();


    const results = {};

    for (const query of queries) {
      const searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchURL);
          // Set screen size
      await page.setViewport({ width: 1080, height: 1024 });

      const isSelectorPresent = await page.$('.related-question-pair');

      if (isSelectorPresent) {
        await page.waitForSelector('.related-question-pair');

        const questions = await page.$$eval('.related-question-pair', (boxes) =>
          boxes.map((box) => box.textContent)
        );

        results[query] = questions;
      } else {
        // If the selector is not present, provide a custom message
        results[query] = [
          "There are no 'People Also Ask Questions'. Please add more keywords or try another query.",
        ];
      }
    }

    await browser.close();

    const logStatement = `The title of this blog post is ${JSON.stringify(results)}`;
    console.log(results)
    console.log(logStatement);
    res.send(results);
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };





