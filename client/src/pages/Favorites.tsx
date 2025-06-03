import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
// import "../css/Favorites.css"; // Optional styling

const GET_FAVORITES = gql`
  query {
    favoriteRecipes {
      id
      name
      image
    }
  }
`;

const REMOVE_RECIPE = gql`
  mutation RemoveRecipe($id: ID!) {
    removeRecipe(id: $id) {
      _id
      recipes {
        id
      }
    }
  }
`;

interface Recipe {
  id: string;
  name: string;
  image: string;
}

const Favorites: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_FAVORITES);
  const [removeRecipe, { loading: removing }] = useMutation(REMOVE_RECIPE);

  const favorites: Recipe[] = data?.favoriteRecipes || [];

  const handleRemove = async (id: string) => {
    try {
      await removeRecipe({
        variables: { id },
      });
      refetch(); // Refresh the favorites list after removal
    } catch (err) {
      console.error("Error removing recipe:", err);
    }
  };

  return (
    <div className="favorites-page">
      <h1>❤️ My Favorite Recipes</h1>

      {loading && <p>Loading favorites...</p>}
      {error && <p>Error loading favorites: {error.message}</p>}

      {favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map((recipe) => (
            <div className="box favorite-recipe" key={recipe.id}>
              <h3>{recipe.name}</h3>
              <img
                src={recipe.image}
                alt={recipe.name}
                className="recipe-img"
              />
              <div className="button-group">
                <button className="btn cook">Cook</button>
                <button
                  className="btn remove"
                  onClick={() => handleRemove(recipe.id)}
                  disabled={removing}
                >
                  {removing ? "Removing..." : "Remove from Favorites"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>You haven’t added any favorites yet!</p>
      )}
    </div>
  );
};

export default Favorites;
