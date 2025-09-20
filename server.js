// install: npm install express puppeteer
import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/check", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Missing code" });

  const browser = await puppeteer.launch({
    headless: true, // for debugging
    args: ["--ignore-certificate-errors"],
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://servicios.siur.com.co/saldo/", {
      waitUntil: "domcontentloaded",
    });

    // Fill and submit
    await page.type("#tin", code);
    await page.click("#saldo");

    // Wait until the text includes "$"
    await page.waitForFunction(() => {
      const c = document.querySelector("#con");
      return c && c.textContent.includes("$");
    });

    // ✅ Extract with textContent and fix &nbsp;
    const result = await page.$eval("#con", (el) =>
      el.textContent.replace(/\u00a0/g, " ").trim()
    );

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await browser.close();
  }
});

app.listen(3000, () =>
  console.log("✅ Server running on http://localhost:3000")
);
