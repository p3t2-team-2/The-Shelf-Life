import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import { QUERY_SINGLE_PROFILE, QUERY_ME } from '../utils/queries';

import Auth from '../utils/auth';
import '../css/Profile.css';

const Profile = () => {
  const { profileId } = useParams();

  const { loading, data } = useQuery(
    profileId ? QUERY_SINGLE_PROFILE : QUERY_ME,
    {
      variables: { profileId: profileId },
    }
  );

  const profile = data?.me || data?.profile || {};

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
      

      <div className="main-content">
        <aside className="sidebar">
          <button className="btn">☰ Menu</button>
          <button className="btn">Calendar</button>
          <button className="btn">Favorite Recipes</button>
          <button className="btn">Pantry</button>
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
            <p>(Opens modal)</p>
          </div>
        </section>

        <section className="filters">
          <div className="filter-box">
            <h3>Filter / Sort</h3>
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
