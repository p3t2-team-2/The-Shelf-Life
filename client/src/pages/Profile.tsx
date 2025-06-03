import React from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { QUERY_SINGLE_PROFILE, QUERY_ME } from '../utils/queries';
import Auth from '../utils/auth';
import '../css/Profile.css';

import FilterModal from '../components/FilterModal';
import CreateRecipeModal from '../components/CreateRecipeModal';

const Profile = () => {
  const { profileId } = useParams();

  const { loading, data } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    {
      variables: { profileId },
    }
  );

  const [shoppingList, setShoppingList] = React.useState<any[]>([]);


  const profile = data?.me || data?.profile || {};

  const [modalOpen, setModalOpen] = React.useState(false);
  const [createModalOpen, setCreateModalOpen] = React.useState(false);

  const [filters, setFilters] = React.useState({
    sort: 'random',
    expiringFirst: false,
    maxPrice: 100,
    maxCookTime: 180,
    dietary: [],
    mealType: '',
    cuisine: '',
    appliance: '',
    maxValue: 100,
  });

  // Redirect if viewing own profile through /profile/:profileId
  if (
    Auth.loggedIn() &&
    profileId &&
    Auth.getProfile().data._id === profileId
  ) {
    return <Navigate to="/me" />;
  }

  if (loading) return <div>Loading...</div>;

  if (!profile?.name) {
    return (
      <h4>
        You need to be logged in to view your profile. Use the navigation
        links above to sign up or log in!
      </h4>
    );
  }

  const favoriteRecipes = profile.favorites || [];

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
          <Link to="/calendar" className="btn">Calendar</Link>
          <Link to="/favorites" className="btn">Favorite Recipes</Link>
          <Link to="/pantry" className="btn">Pantry</Link>
        </aside>

        {/* Favorite Recipes Section */}
        <section className="favorites">
          <h2>{profile.name}'s Favorite Recipes</h2>
          {favoriteRecipes.length > 0 ? (
            favoriteRecipes.map((recipe: any) => (
              <div className="favorite-card" key={recipe._id}>
                <h3>{recipe.title}</h3>
                <p>{recipe.hasAllIngredients ? '✅ Has all ingredients' : '❌ Missing ingredients'}</p>
                <div className="icons">
                  <button className="btn">🗑 Remove</button>
                  <button className="btn">👨‍🍳 Cook</button>
                </div>
              </div>
            ))
          ) : (
            <p>No favorite recipes yet.</p>
          )}
        </section>

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
        sortOption={filters.sort}
      />

      {/* Create Recipe Modal */}
      <CreateRecipeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={(recipe) => {
          console.log('Recipe created:', recipe);
          setCreateModalOpen(false);
          // Optional: trigger refetch or update local state
        }}
      />

      {/* Shopping List Section */}
<section className="shopping-list">
  <h2>🛒 Shopping List</h2>
  {shoppingList.length > 0 ? (
    <ul>
      {shoppingList.map((item: any, index: number) => (
        <li key={index}>
          {item.item} - {item.quantity} {item.unit}
        </li>
      ))}
    </ul>
  ) : (
    <p>No items in your shopping list.</p>
  )}
  {/* <button className="btn" 
  onClick={handleAddToPantry}>
    Add All to Pantry
  </button> */}
</section>

    </div>
  );
};

export default Profile;
