// This script queries the Spoonacular API for all ingredients, 100 at a time, and saves them to a JSON file.
import axios from "axios";
import fs from "fs";
import path from "path";
// Fix __dirname for ES modules
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apikey =
  process.env.SPOONACULAR_API_KEY || "3bd77b3709fb484690335c5666187f24";
const PAGE_SIZE = 100;
const OUTPUT_FILE = path.join(__dirname, "all_ingredients.json");
async function fetchAllIngredients() {
  const allIngredients = [];
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  let requestCount = 0;
  let progress = { letterIndex: 0, offset: 0 };
  const PROGRESS_FILE = path.join(__dirname, "fetch_progress.json");
  // Load progress if exists
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    } catch (e) {
      console.error("Could not read progress file, starting from scratch.");
    }
  }
  for (let i = progress.letterIndex; i < alphabet.length; i++) {
    const letter = alphabet[i];
    let offset = i === progress.letterIndex ? progress.offset : 0;
    let totalResults = 1;
    while (offset < totalResults && requestCount < 150) {
      const url = `https://api.spoonacular.com/food/ingredients/search?apiKey=${apikey}&number=${PAGE_SIZE}&offset=${offset}&query=${letter}`;
      const response = await axios.get(url);
      const { results, totalResults: total } = response.data;
      if (offset === 0) totalResults = total;
      allIngredients.push(...results);
      requestCount++;
      console.log(
        `Fetched ${
          allIngredients.length
        } ingredients so far (current letter: ${letter}, ${
          offset + results.length
        } / ${totalResults}, request #${requestCount})`
      );
      offset += PAGE_SIZE;
      // Save progress
      fs.writeFileSync(
        PROGRESS_FILE,
        JSON.stringify({ letterIndex: i, offset }, null, 2)
      );
      // Add 5 second delay between requests
      if (offset < totalResults && requestCount < 150) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    // Reset offset for next letter
    progress.offset = 0;
  }
  // Deduplicate by ingredient id
  const uniqueIngredients = Object.values(
    allIngredients.reduce((acc, ingredient) => {
      acc[ingredient.id] = ingredient;
      return acc;
    }, {})
  );
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueIngredients, null, 2));
  fs.unlinkSync(PROGRESS_FILE); // Remove progress file when done
  console.log(`All unique ingredients saved to ${OUTPUT_FILE}`);
}
fetchAllIngredients().catch((err) => {
  console.error("Error fetching ingredients:", err);
});
