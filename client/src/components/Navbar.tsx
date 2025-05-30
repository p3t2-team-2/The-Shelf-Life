import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import auth from '../utils/auth.js';
import SearchBar from './Searchbar.tsx';
import '../css/Navbar.css'; 
import '../css/main.css'


const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

const Navbar = () => {
  const [loginCheck, setLoginCheck] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const navigate = useNavigate();

  const isLoginPage = window.location.pathname === '/login';

  useEffect(() => {
    if (auth.loggedIn()) setLoginCheck(true);
  }, [loginCheck]);

  const handleSearch = (query: string) => {
    if (query) navigate(`/search?query=${query}`);
  };

  const toggleMenu = () => setMenuActive(!menuActive);

  return (
    <header>
      <h1>The Shelf Life</h1>

      {!isLoginPage && auth.loggedIn() && (
        <div className="search-bar-container">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      {/* Hamburger for mobile */}
      <button className={`hamburger ${menuActive ? 'active' : ''}`} onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </button>

      {/* Navigation */}
      <nav className={`navbar-links ${menuActive ? 'active' : ''}`}>
        {!isLoginPage && !auth.loggedIn() && (
          <Link to="/login" className="btn-login">Login</Link>
        )}

        {!isLoginPage && auth.loggedIn() && (
          <>
            <Link to="/" className="btn">Home</Link>
            <Link to="/profile" className="btn">Profile</Link>
            <Link to="/recipes" className="btn">Recipes</Link>
            <Link to="/pantry" className="btn">Pantry</Link>
            <button className="btn-logout" type="button" onClick={() => auth.logout()}>
              Logout
            </button>
          </>
        )}

        {/* Show theme toggle when logged in */}
        {!isLoginPage && <ThemeToggle />}
      </nav>
    </header>
  );
};

export default Navbar;
