import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import "../css/Favorites.css";

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

const REMOVE_FROM_PANTRY = gql`
  mutation RemoveFromPantry($removeFromPantryId: Int!) {
    removeFromPantry(id: $removeFromPantryId) {
      id
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

  const [removeRecipe, { loading: removing }] = useMutation(REMOVE_FROM_PANTRY, {
    refetchQueries: [{ query: QUERY_PROFILE, variables: { profileId } }],
  });



  const favorites: Recipe[] = data?.profile?.recipes || [];

  // Remove recipe from favorites
  const removeFromPantry = async (id: number) => {
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
      <h1 className="btn">My Cook Book</h1>

      {loadingFavorites && <p>Loading favorites...</p>}
      {error && <p>Error loading favorites: {error.message}</p>}

      {favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map((recipe) => (
            <div className="favorite-card" key={recipe.id}>
              <Link to={`/recipes/${recipe.id}`}>
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="recipe-img"
                />
                <h3>{recipe.name}</h3>
              </Link>
              <div className="icons">
  <button
    className="btn "
    onClick={() => removeFromPantry(Number(recipe.id))}
  >
    {removing ? "Removing..." : "Remove from Favorites"}
  </button>
                
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loadingFavorites && <p className="btn">You haven’t added any favorites yet!</p>
      )}
    </div>
  );
};

export default Favorites;
