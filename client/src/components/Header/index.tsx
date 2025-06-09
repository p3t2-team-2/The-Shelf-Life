import { Link } from "react-router-dom";
import { type MouseEvent } from "react";
import Auth from "../../utils/auth";
import "./Header.css";
import logo from "../../assets/shelf_life_logo_transparent_aggressive.png";
// import SearchBar from '../Searchbar';
import SearchBar from "../Searchbar";

const Header = () => {
  const logout = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    Auth.logout();
  };

  //  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header>
      <div>
        <div>
          <img src={logo} alt="Logo" className="logo" />
          {Auth.loggedIn() ? (
            <div className="nav-container">
              <div className="nav-links">
            <Link to="/home">Home</Link>
              <Link to="/favorites">Cook Book</Link>
              <Link to="/pantry">Pantry</Link>
              <Link to="/shoppinglist">Shopping List</Link>
              <Link to="/calendar">Meal Planner</Link>
              <Link to="/recommended">Recommended</Link>
              <Link to="/bio">Bio</Link>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
                </div>
                <div className="nav-search">
              <SearchBar />
              </div>
            </div>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
              <Link to="/Bio">Bio</Link>
              {/* <Link to="/recipes">Recipes</Link> */}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
