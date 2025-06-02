import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import auth from '../utils/auth.js';
import SearchBar from './Searchbar.tsx';
import '../css/Navbar.css';
import '../css/main.css';

const ThemeToggle = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

const Navbar = () => {
  const [loginCheck, setLoginCheck] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loggedIn()) setLoginCheck(true);
  }, []);

  const isLoginPage = window.location.pathname === '/login';

  const handleSearch = (query: string) => {
    if (query) navigate(`/search?query=${query}`);
  };

  const toggleMenu = () => setMenuActive(!menuActive);

  return (
    <header className="navbar-container">
      <div className="navbar-header">
        <h1>The Shelf Life</h1>

        <button className={`hamburger ${menuActive ? 'active' : ''}`} onClick={toggleMenu}>
          <div></div><div></div><div></div>
        </button>
      </div>

      {!isLoginPage && auth.loggedIn() && (
        <div className="search-bar-container">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      <nav className={`navbar-links ${menuActive ? 'active' : ''}`}>
        {!isLoginPage && auth.loggedIn() && (
          <>
            <Link to="/" className="btn">Home</Link>
            <Link to="/profile" className="btn">My Profile</Link>
            <Link to="/pantry" className="btn">Pantry</Link>
            <Link to="/calendar" className="btn">Meal Planner</Link>
            <Link to="/bio" className="btn">Bio</Link>
            <button className="btn-logout" onClick={() => auth.logout()}>Logout</button>
          </>
        )}

        {!isLoginPage && !auth.loggedIn() && (
          <Link to="/login" className="btn-login">Login</Link>
        )}

        {!isLoginPage && <ThemeToggle />}
      </nav>
    </header>
  );
};

export default Navbar;