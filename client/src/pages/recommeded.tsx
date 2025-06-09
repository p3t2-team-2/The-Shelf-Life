import { gql } from '@apollo/client';
import React from "react";
import { useQuery } from "@apollo/client";
import '../css/Recommended.css'


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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Recommended Recipes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recipes.map((recipe: any) => (
          <div
            key={recipe.id}
            className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition"
          >
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-48 object-cover rounded-md mb-2"
            />
            <h2 className="text-lg font-semibold">{recipe.name}</h2>
            {/* Optional: Link to recipe detail page */}
            {/* <Link to={`/recipes/${recipe.id}`} className="text-blue-500">View Details</Link> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedRecipesPage;
