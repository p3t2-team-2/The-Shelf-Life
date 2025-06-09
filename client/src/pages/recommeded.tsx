import { gql } from '@apollo/client';
import React from "react";
import { useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import '../css/Recommended.css'; // Your provided CSS file

const GET_RECOMMENDED_RECIPES = gql`
  query RecommendedRecipes {
    recommendedRecipes {
      id
      name
      image
    }
  }
`;

const RecommendedRecipesPage: React.FC = () => {
  const { data, loading, error } = useQuery(GET_RECOMMENDED_RECIPES, {
    fetchPolicy: "network-only"
  });

  if (loading) return <p>Loading recommended recipes...</p>;
  if (error) return <p>Error loading recommendations: {error.message}</p>;

  const recipes = data?.recommendedRecipes || [];

  return (
    <div className="favorites-page">
      <h1 className="text-2xl font-bold mb-4">Recommended Recipes</h1>
      <div className="favorites-grid">
        {recipes.map((recipe: any) => (
          <div key={recipe.id} className="favorite-card">
            <Link to={`/recipes/${recipe.id}`}>
                            <img
                              src={recipe.image}
                              alt={recipe.name}
                              className="recipe-img"
                            />
            </Link>
            <h3>{recipe.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedRecipesPage;
