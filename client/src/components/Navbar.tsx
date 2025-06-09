import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import auth from "../utils/auth.js";
import SearchBar from "./Searchbar.tsx";
import "../css/Header.css"; 
import "../css/Navbar.css"; // Ensure you have the correct path to your CSS file
import logo from "../assets/shelf_life_logo_transparent_aggressive.png";

const Navbar = () => {
  const [menuActive, setMenuActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.loggedIn()) {
      // optional: set something if needed
    }
  }, []);


  const handleSearch = (query: string) => {
    if (query) navigate(`/search?query=${query}`);
  };

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  const loggedIn = auth.loggedIn();

  return (
    <header>
      <img src={logo} alt="Logo" className="logo" />

      <button className={`hamburger ${menuActive ? "active" : ""}`} onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </button>

      <nav className={menuActive ? "active" : ""}>
        {loggedIn ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/favorites">Cook Book</Link>
            <Link to="/pantry">Pantry</Link>
            <Link to="/shoppinglist">Shopping List</Link>
            <Link to="/calendar">Meal Planner</Link>
            <Link to="/recommended">Recommended</Link>
            <Link to="/bio">Bio</Link>
            <button onClick={() => auth.logout()} className="logout-button">
              Logout
            </button>
            <div className="SearchBarContainer">
            <SearchBar onSearch={handleSearch} />
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/bio">Bio</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
