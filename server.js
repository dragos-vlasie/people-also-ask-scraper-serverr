const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/scrape', async (req, res) => {
  try {
    const { queries } = req.body;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    const results = {};

    for (const query of queries) {
      const searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      await page.goto(searchURL);

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

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in server:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
