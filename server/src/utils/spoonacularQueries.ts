import axios from 'axios';

const apikey = process.env.SPOONACULAR_API_KEY;

// Searches for all recipes to display on the home page
export const searchRecipes = async () => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/random?number=5&apiKey=${apikey}`);
    const recipes = response.data.recipes;

    return recipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
    }));
  } catch (error) {
    console.error('Spoonacular API error:', error);
    throw new Error('Failed to fetch recipes');
  }
};
// Searches for recipes by keyword
export const searchRecipesByKeyword = async (keywords: string[]) => {
  try {
    let query = "";
    keywords.forEach((keyword, index) => {
      if (index === 0) {
        query += `${keyword},`;
      }else if (index < keywords.length - 1) {
        query += `+${keyword},`;
      }else {
        query += `+${keyword}`;
      }
    })
    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${apikey}`);
    const recipes = response.data.results;

    return recipes.map((recipe: any) => ({
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
    }));
  } catch (error) {
    console.error('Spoonacular API error:', error);
    throw new Error('Failed to fetch recipes');
  }
}
// Full recipe when hitting "Cook" 