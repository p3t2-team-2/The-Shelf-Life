import React from 'react';
import '../css/Recipes.css'

const recipes = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    description: "Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.",
    image: "carbonara.jpg"
  },
  {
    id: 2,
    name: "Chicken Tikka Masala",
    description: "Rich and creamy Indian curry with marinated chicken cooked in a spiced tomato sauce.",
    image: "tikka-masala.jpg"
  },
  {
    id: 3,
    name: "Chocolate Lava Cake",
    description: "Decadent chocolate cake with a gooey molten center.",
    image: "lava-cake.jpg"
  }
];

const Recipes: React.FC = () => {
  return (
    <div className="recipes-page">
      <h1>Your Favorite Recipes</h1>
      <p>Here you can find a list of your favorite recipes that you've added to your profile.</p>

      <div className="content-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="box">
            <img src={recipe.image} alt={recipe.name} className="recipe-img" />
            <h2>{recipe.name}</h2>
            <p>{recipe.description}</p>

            <div className="button-group">
              <button className="btn cook">Cook</button>
              <button className="btn favorite">Favorite</button>
              <button className="btn modal">More Info</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
