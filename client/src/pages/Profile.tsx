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
      variables: { profileId: profileId },
    }
  );

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

  if (Auth.loggedIn() && Auth.getProfile().data._id === profileId) {
    return <Navigate to="/me" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile?.name) {
    return (
      <h4>
        You need to be logged in to see your profile page. Use the navigation
        links above to sign up or log in!
      </h4>
    );
  }

  return (
    <div className="profile-page">

      {/* ✅ Top bar with Filter/Sort button */}
      <div className="top-bar">
        <button className="btn modal" onClick={() => setModalOpen(true)}>
          🔍 Filter & Sort
        </button>
      </div>

      <div className="main-content">
        <aside className="sidebar">
          <button className="btn">☰ Menu</button>
          <Link to="/calendar" className="btn">Calendar</Link>
          <Link to="/favorites" className="btn">Favorite Recipes</Link>
          <Link to="/pantry" className="btn">Pantry</Link>
        </aside>

        <section className="favorites">
          <div className="favorite-card">
            <h3>Favorited Recipe 1</h3>
            <p>✅ Has all ingredients</p>
            <div className="icons">
              <button className="btn">🗑 Remove</button>
              <button className="btn">👨‍🍳 Cook</button>
            </div>
          </div>
        </section>

        <section className="modals">
          <div className="modal-box">
            <h3>Create Custom Recipe</h3>
            <button className="btn" onClick={() => setCreateModalOpen(true)}>
              Open Recipe Modal
            </button>
          </div>
        </section>
      </div>

      {/* ✅ Filter Modal */}
      <FilterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setModalOpen(false);
        }}
        sortOption={filters.sort}
      />

      {/* ✅ Create Recipe Modal */}
      <CreateRecipeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={(recipe) => {
          console.log('Recipe created:', recipe);
          setCreateModalOpen(false);
          // Future: send to backend or local storage
        }}
      />
    </div>
  );
};

export default Profile;