import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import auth from '../utils/auth.js';
import SearchBar from './Searchbar.tsx';
import '../css/Navbar.css'; 


const Navbar = () => {
  // State to track the login status
  const [loginCheck, setLoginCheck] = useState(false);
  const [menuActive, setMenuActive] = useState(false); // State to handle menu toggle
  const navigate = useNavigate();

  const isLoginPage = window.location.pathname === '/login'; // Check if the current page is the login page

  // Function to check if the user is logged in using auth.loggedIn() method
  const checkLogin = () => {
    if (auth.loggedIn()) {
      setLoginCheck(true); // Set loginCheck to true if user is logged in
    }
  };

  const handleSearch = (query: string) => {
    if (query) {
      navigate(`/search?q=${query}`);
    }
  };

  // useEffect hook to run checkLogin() on component mount and when loginCheck state changes
  useEffect(() => {
    checkLogin(); // Call checkLogin() function to update loginCheck state
  }, [loginCheck]); // Dependency array ensures useEffect runs when loginCheck changes

  // Function to toggle the mobile menu
  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  return (
    <div className="display-flex justify-space-between align-center py-2 px-5 mint-green">
      <h1>The Shelf Life</h1>

      {/* Conditionally render the search bar if not on the login page */}
      {!isLoginPage && auth.loggedIn() && (
        <div className="search-bar-container">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      {/* Hamburger Icon for mobile */}
      <button
        className={`hamburger ${menuActive ? 'active' : ''}`}
        onClick={toggleMenu}
      >
        <div></div>
        <div></div>
        <div></div>
      </button>

      {/* Links for Navbar */}
      <div className={`navbar-links ${menuActive ? 'active' : ''}`}>
        {/* Only show the login button if not on the login page */}
        {!isLoginPage && !auth.loggedIn() && (
  <button className="btn-login" type="button">
    <Link to="/login">Login</Link>
  </button>
        )}

        {/* Conditionally render the navigation buttons based on login status */}
        {!isLoginPage && auth.loggedIn() && (
          <>
            <button className="btn" type="button">
              <Link to="/">Home🏠︎</Link>
            </button>
            <button className="btn" type="button">
              <Link to="/">Profile</Link>
            </button>
            <button className="btn" type="button">
              <Link to="/">Recipes</Link>
            </button>
            <button className="btn" type="button">
              <Link to="/">Pantry</Link>
            </button>
           
            {auth.loggedIn() && (
  <button className="btn-logout" type="button" onClick={() => auth.logout()}>
    Logout
  </button>
)}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;