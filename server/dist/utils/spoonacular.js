import axios from 'axios';
const apikey = process.env.SPOONACULAR_API_KEY;
// const BASE_URL = 'https://api.spoonacular.com';
export const searchRecipes = async () => {
    try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/random?number=5&**apiKey**=15d0763886a54674b9f063f359c19d38
`);
        console.log('**********************************************');
        console.log('Spoonacular API response:', apikey);
        console.log('**********************************************');
        return response.data.results;
    }
    catch (error) {
        console.error('Spoonacular API error:', error);
        throw new Error('Failed to fetch recipes');
    }
};
