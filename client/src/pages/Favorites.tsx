import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

const QUERY_ME = gql`
  query Query {
    me {
      _id
    }
  }
`;

const QUERY_PROFILE = gql`
  query Query($profileId: ID!) {
    profile(profileId: $profileId) {
      recipes {
        id
        name
        image
        description
        ingredients {
          id
          item
          quantity
          unit
        }
        instructions {
          number
          step
          time
        }
      }
    }
  }
`;

const REMOVE_RECIPE = gql`
  mutation RemoveRecipe($id: Int!) {
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
  description: string;
  ingredients: { id: number; item: string; quantity: number; unit: string }[];
  instructions: { number: number; step: string; time?: string }[];
}

const Favorites: React.FC = () => {
  // Fetch authenticated user's profile ID
  const { loading: loadingMe, data: dataMe } = useQuery(QUERY_ME);
  const profileId = dataMe?.me?._id;

  // Fetch favorite recipes for the profile
  const {
    loading: loadingFavorites,
    error,
    data,
    refetch,
  } = useQuery(QUERY_PROFILE, {
    variables: { profileId },
    skip: !profileId,
  });

  const [removeRecipe, { loading: removing }] = useMutation(REMOVE_RECIPE, {
    refetchQueries: [{ query: QUERY_PROFILE, variables: { profileId } }],
  });

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const favorites: Recipe[] = data?.profile?.recipes || [];

  // Remove recipe from favorites
  const handleRemove = async (id: number) => {
    try {
      await removeRecipe({ variables: { id } });
      refetch(); // Ensure UI updates after removal
    } catch (err) {
      console.error("Error removing recipe:", err);
    }
  };

  if (loadingMe) return <p>Loading profile...</p>;
  if (!profileId) return <p>You need to be logged in to view favorites.</p>;

  return (
    <div className="favorites-page">
      <h1>❤️ My Favorite Recipes</h1>

      {loadingFavorites && <p>Loading favorites...</p>}
      {error && <p>Error loading favorites: {error.message}</p>}

      {favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map((recipe) => (
            <div
              className="favorite-card"
              key={recipe.id}
              onClick={() => setSelectedRecipe(recipe)} // Open modal with recipe details
            >
              <img
                src={recipe.image}
                alt={recipe.name}
                className="recipe-img"
              />
              <h3>{recipe.name}</h3>
              <div className="icons">
                <button
                  className="btn remove"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent modal from opening when clicking "Remove"
                    handleRemove(parseInt(recipe.id, 10));
                  }}
                  disabled={removing}
                >
                  {removing ? "Removing..." : "Remove from Favorites"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loadingFavorites && <p>You haven’t added any favorites yet!</p>
      )}

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedRecipe.name}</h2>
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.name}
              className="modal-img"
            />
            <p>{selectedRecipe.description}</p>
            <h3>Ingredients:</h3>
            <ul>
              {selectedRecipe.ingredients.map((ingredient) => (
                <li key={ingredient.id}>
                  {ingredient.quantity} {ingredient.unit} {ingredient.item}
                </li>
              ))}
            </ul>
            <h3>Instructions:</h3>
            <ol>
              {selectedRecipe.instructions.map((step) => (
                <li key={step.number}>
                  <strong>Step {step.number}: </strong> {step.step}{" "}
                  {step.time ? `(${step.time} mins)` : ""}
                </li>
              ))}
            </ol>
            <button className="btn" onClick={() => setSelectedRecipe(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
