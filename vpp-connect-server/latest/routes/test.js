const puppeteer = require("puppeteer");

async function fetchWithPuppeteer(query) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    );

    await page.goto(`https://z-lib.io/s/${encodeURIComponent(query)}`, {
        waitUntil: "networkidle2",
    });

    const content = await page.content();
    await browser.close();

    console.log(content);
}

fetchWithPuppeteer("Machine learning");