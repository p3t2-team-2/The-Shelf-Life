import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, gql, useMutation } from "@apollo/client";

import "../css/Profile.css";

import FilterModal from "../components/FilterModal";
import CreateRecipeModal from "../components/CreateRecipeModal";

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
        name
      }
    }
  }
`;

const Profile = () => {
  const { loading: loadingMe, data: dataMe } = useQuery(QUERY_ME);
  const profileId = dataMe?.me?._id;

  // Fetch profile recipes
  const {
    loading: loadingProfile,
    data: dataProfile,
    refetch,
  } = useQuery(QUERY_PROFILE, {
    variables: { profileId },
    skip: !profileId,
  });

  const profile = dataProfile?.profile || {};

  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  // Add filters state
  const [filters, setFilters] = useState<{ sort?: string }>({});

  type Recipe = {
    id: string;
    name: string;
    description: string;
    ingredients: { id: string; item: string; quantity: number; unit: string }[];
    instructions: { number: number; step: string; time?: number }[];
  };

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [removeRecipe] = useMutation(REMOVE_RECIPE, {
    refetchQueries: [{ query: QUERY_PROFILE, variables: { profileId } }],
  });

  // ⬇️ REFRESH DATA EVERY TIME PROFILE PAGE LOADS
  useEffect(() => {
    if (profileId) {
      refetch(); // Ensure latest favorites are loaded
    }
  }, [profileId]); // Runs every time profileId changes

  if (loadingMe) return <div>Loading user data...</div>;
  if (!profileId) {
    return (
      <h4>
        You need to be logged in to view your profile. Use the navigation links
        above to sign up or log in!
      </h4>
    );
  }

  if (loadingProfile) return <div>Loading profile...</div>;

  return (
    <div className="profile-page">
      {/* Top bar */}
      <div className="top-bar">
        <button className="btn modal" onClick={() => setModalOpen(true)}>
          🔍 Filter & Sort
        </button>
      </div>

      <div className="main-content">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <button className="btn">☰ Menu</button>
          <Link to="/calendar" className="btn">
            Calendar
          </Link>
          <Link to="/favorites" className="btn">
            Favorite Recipes
          </Link>
          <Link to="/pantry" className="btn">
            Pantry
          </Link>
        </aside>

        {/* Favorite Recipes Section */}
        <section className="favorites">
          <h2>Favorite Recipes</h2>
          {profile.recipes.length > 0 ? (
            profile.recipes.map((recipe: any) => (
              <div
                className="favorite-card"
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)} // Open modal with recipe details
              >
                <h3>{recipe.name}</h3>
                <div className="icons">
                  <button
                    className="btn"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from opening modal
                      removeRecipe({
                        variables: { id: parseInt(recipe.id, 10) },
                      });
                    }}
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No favorite recipes yet.</p>
          )}
        </section>

        {/* Recipe Details Modal */}
        {selectedRecipe && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedRecipe(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedRecipe.name}</h2>
              <p>{selectedRecipe.description}</p>
              <h3>Ingredients:</h3>
              <ul>
                {selectedRecipe.ingredients.map((ingredient: any) => (
                  <li key={ingredient.id}>
                    {ingredient.quantity} {ingredient.unit} {ingredient.item}
                  </li>
                ))}
              </ul>
              <h3>Instructions:</h3>
              <ol>
                {selectedRecipe.instructions.map((step: any) => (
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

        {/* Custom Recipe Modal Launcher */}
        <section className="modals">
          <div className="modal-box">
            <h3>Create Custom Recipe</h3>
            <button className="btn" onClick={() => setCreateModalOpen(true)}>
              Open Recipe Modal
            </button>
          </div>
        </section>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setModalOpen(false);
        }}
        sortOption={filters.sort ?? ""}
      />

      {/* Create Recipe Modal */}
      <CreateRecipeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={(recipe) => {
          console.log("Recipe created:", recipe);
          setCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default Profile;
