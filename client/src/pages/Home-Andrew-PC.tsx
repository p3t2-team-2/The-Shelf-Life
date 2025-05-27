import React from 'react';
import { useQuery, gql } from '@apollo/client';
import '../css/Home.css';
import { QUERY_PROFILES } from '../utils/queries';

// GraphQL query to get recipes from Spoonacular through your backend
const GET_SPOONACULAR_RECIPES = gql`
  query {
    spoonacularRecipes {
      id
      title
      image
    }
  }
`;

// Define the Recipe type
interface Recipe {
  id: string;
  title: string;
  image: string;
}

const Home: React.FC = () => {
  const { loading: loadingProfiles, data: profileData } = useQuery(QUERY_PROFILES);
  const profiles = profileData?.profiles || [];

  const { loading: loadingRecipes, data: recipeData, error } = useQuery(GET_SPOONACULAR_RECIPES);
  const recipes: Recipe[] = recipeData?.spoonacularRecipes || [];

  // Utility function to pick N random items from an array
  function getRandomItems<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  const randomRecipeCount = 5; // Number of random recipes to display

  // Get 2 random recipes (or fewer if not enough available)
  const randomRecipes: Recipe[] = recipes.length > 0 ? getRandomItems(recipes, randomRecipeCount) : [];

  return (
    <div className="homepage">   
      <main className="content-grid">

        {/* Left: Random Recipes */}
        {loadingRecipes ? (
          <div className="box random-recipe">
            <h2>Randomly Selected Recipes</h2>
            <p>Loading recipes...</p>
          </div>
        ) : error ? (
          <div className="box random-recipe">
            <h2>Randomly Selected Recipes</h2>
            <p>Error loading recipes: {error.message}</p>
          </div>
        ) : randomRecipes.length > 0 ? (
          randomRecipes.map((recipe) => (
            <div className="box random-recipe" key={recipe.id}>
              <h2>Randomly Selected Recipe</h2>
              <h3>{recipe.title}</h3>
              <img src={recipe.image} alt={recipe.title} className="recipe-img" />
              <p>✅ Has all ingredients</p>
              <div className="button-group">
                <button className="btn cook">Cook</button>
                <button className="btn favorite">Add to Favorites</button>
              </div>
            </div>
          ))
        ) : (
          <div className="box random-recipe">
            <h2>Randomly Selected Recipes</h2>
            <p>No recipes found.</p>
          </div>
        )}

        {/* Center: Featured Recipe */}
        <div className="box featured-recipe">
          <h2>⭐ Featured (User Favorite) Recipe</h2>
          <ul>
            <li>✅ Has all ingredients</li>
            <li>
              💬 <a href="/comments">View Comments</a>
            </li>
          </ul>
          {loadingProfiles ? (
            <div>Loading user profiles...</div>
          ) : (
            <p>There are {profiles.length} users.</p>
          )}
        </div>

        {/* Right: Filter/Sort Modal Trigger */}
        <div className="box filter-modal">
          <h2>Filter / Sort</h2>
          <ul>
            <li>Expiring first</li>
            <li>Price</li>
            <li>Cook time / complexity</li>
            <li>Nutritional value</li>
            <li>Dietary restrictions</li>
            <li>Meal type</li>
            <li>Cuisine</li>
            <li>Cooking appliance</li>
          </ul>
          <p>Sliders – Don’t show with value higher than X</p>
          <button className="btn modal">Open Filter Modal</button>
        </div>

      </main>

      <footer className="footer">(Home Page)</footer>
    </div>
  );
};

export default Home;
