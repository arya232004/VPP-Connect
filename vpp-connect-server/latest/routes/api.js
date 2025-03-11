const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();

app.use(cors());

// API endpoint to fetch book details
app.get("/searchbooks", async(req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Please provide a search query" });
    }

    try {
        const url = `https://z-lib.io/s/${encodeURIComponent(query)}`;

        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
        );

        await page.goto(url, {
            waitUntil: "networkidle2",
        });

        const content = await page.content();
        await browser.close();
        const $ = cheerio.load(content);
        const books = [];

        $(".resItemBox").each((index, element) => {
            const title = $(element).find("h3 a").text().trim();
            const author = $(element).find(".authors a").text().trim();
            const year = $(element)
                .find(".bookProperty.property_year .property_value")
                .first()
                .text()
                .trim();
            const language = $(element)
                .find(".bookProperty.property_language .property_value")
                .first()
                .text()
                .trim();
            const rating = $(element)
                .find(".book-rating-interest-score span")
                .first()
                .text()
                .trim();
            const bookUrl = $(element).find("h3 a").attr("href");
            const coverImage =
                $(element).find(".itemCoverWrapper img").attr("data-src") || // Preferred method
                $(element).find(".itemCoverWrapper img").attr("src") || // Fallback if `data-src` isn't there
                "N/A";

            books.push({
                title: title || "N/A",
                author: author || "N/A",
                year: year || "N/A",
                language: language || "N/A",
                rating: rating || "N/A",
                bookUrl: bookUrl ? bookUrl : "N/A",
                coverImage: coverImage || "N/A",
            });
        });

        res.json({ books });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ error: error });
    }
});


// API endpoint to fetch course details from ClassCentral
app.get("/searchcourses", async(req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Please provide a search query" });
    }

    try {
        // Build the URL with the search query.
        const url = `https://www.classcentral.com/search?q=${encodeURIComponent(
      query
    )}`;

        // Fetch the HTML page
        const { data: html } = await axios.get(url);

        // Load HTML into Cheerio
        const $ = cheerio.load(html);
        const courses = [];

        // Iterate over each course list item
        $("li.course-list-course").each((index, element) => {
            // Extract the dynamic data attribute that holds the course id and name.
            let courseData = {};
            const attribs = element.attribs;
            for (let attr in attribs) {
                if (attr.startsWith("data-lookup-course-")) {
                    // The attribute's value is HTML encoded JSON.
                    const raw = attribs[attr];
                    // Replace HTML entities with their character equivalents.
                    const jsonString = raw
                        .replace(/&#x7B;/g, "{")
                        .replace(/&#x7D;/g, "}")
                        .replace(/&quot;/g, '"');
                    try {
                        courseData = JSON.parse(jsonString);
                    } catch (e) {
                        console.error("Error parsing course data:", e);
                    }
                    break;
                }
            }

            // Extract course URL: Look for the first anchor with href containing "/course/"
            const courseLinkElement = $(element).find('a[href*="/course/"]').first();
            const href = courseLinkElement.attr("href") || "";
            const courseUrl = href ? `https://www.classcentral.com${href}` : "N/A";

            // Extract course image from the first <img>
            const imgElement = $(element).find("img").first();
            const image = imgElement.attr("src") || "N/A";

            // Extract provider from an anchor with href starting with /institution/
            const providerElement = $(element)
                .find('a[href^="/institution/"]')
                .first();
            const provider = providerElement.text().trim() || "N/A";

            // Extract course title – use the h2 inside an anchor with class "course-name"
            const titleElement = $(element).find("a.course-name h2").first();
            let title = titleElement.text().trim();
            if (!title && courseData.name) {
                title = courseData.name;
            }

            // Extract rating (e.g., "84 reviews")
            const ratingElement = $(element)
                .find("span.text-3.color-gray.margin-left-xxsmall")
                .first();
            const rating = ratingElement.text().trim() || "N/A";

            // Extract description from a paragraph with specific classes
            const descElement = $(element)
                .find("p.text-2.margin-bottom-xsmall")
                .first();
            const description = descElement.text().trim() || "N/A";

            courses.push({
                id: courseData.id || index,
                title,
                provider,
                courseUrl,
                image,
                rating,
                description,
            });
        });

        res.json({ courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;