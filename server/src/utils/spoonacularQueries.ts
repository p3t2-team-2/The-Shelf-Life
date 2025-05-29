import axios from 'axios';
import fetch from 'node-fetch';

const apikey = process.env.SPOONACULAR_API_KEY;

// Searches for all recipes to display on the home page
export const searchRecipes = async () => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/random?number=5&apiKey=${apikey}`);
    const recipes = response.data.recipes;

    return recipes.map((recipe: any) => ({
      id: recipe.id,
      name: recipe.title,
      image: recipe.image,
    }));
  } catch (error) {
    console.error('Spoonacular API error:', error);
    throw new Error('Failed to fetch recipes');
  }
};
// Searches for recipes by keyword
export const searchRecipesByKeyword = async (keywords: string | string[]) => {
  try {
    let query = "";
    if (Array.isArray(keywords)){
      keywords.forEach((keyword, index) => {
        if (index === 0) {
          query += `${keyword},`;
        }else if (index < keywords.length - 1) {
          query += `+${keyword},`;
        }else {
          query += `+${keyword}`;
        }
      })
    }else {
      query = keywords;
    }
    query = query.replace("_", ' '); // Replace spaces with plus signs for URL encoding
    console.log('Spoonacular search query:', query);
    const response = await fetch (`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${apikey}`);
    const data = await response.json();
    const recipes = data.results;
    
    
    return recipes.map((recipe: any) => ({
      id: recipe.id,
      name: recipe.title,
      image: recipe.image,
    }));
  } catch (error) {
    console.error('Spoonacular API error:', error);
    throw new Error('Failed to fetch recipes');
  }
}
// Full recipe when hitting "Cook" 