// This script queries the Spoonacular API for all ingredients, 100 at a time, and saves them to a JSON file.
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const apikey = process.env.SPOONACULAR_API_KEY || '0132fcb5cc6e4595a04e81af0e23c2a6';
const PAGE_SIZE = 100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, 'all_ingredients.json');

async function fetchAllIngredients() {
  let offset = 0;
  let totalResults = 1; // Start with 1 to enter the loop
  let allIngredients: any[] = [];

  while (offset < totalResults) {
    const url = `https://api.spoonacular.com/food/ingredients/search?apiKey=${apikey}&number=${PAGE_SIZE}&offset=${offset}`;
    console.log("URL", url);
    const response = await axios.get(url);
    const { results, totalResults: total } = response.data;
    if (offset === 0) totalResults = total;
    allIngredients = allIngredients.concat(results);
    console.log(`Fetched ${allIngredients.length} / ${totalResults} ingredients...`);
    offset += PAGE_SIZE;
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allIngredients, null, 2));
  console.log(`All ingredients saved to ${OUTPUT_FILE}`);
}

fetchAllIngredients().catch(err => {
  console.error('Error fetching ingredients:', err);
});
