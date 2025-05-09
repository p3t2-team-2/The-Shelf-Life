import { Link } from 'react-router-dom';
import { type MouseEvent} from 'react';
import Auth from '../../utils/auth';
import "./Header.css"
import profileImg from "../../assets/profile-user.png" 
import logo from "../../assets/shelf_life_logo_transparent_aggressive.png"
import SearchBar from '../Searchbar';

const Header = () => {
  const logout = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    Auth.logout();
  };
  return (
    <header>
      <div>
        
        <div>
        <img src={logo} alt="Logo" className='logo'/>
        <Link to="/">          
          Home
        </Link>
          {Auth.loggedIn() ? (
            <>
              <Link to="/Profile">
                <img src={profileImg} alt="Profile" /> My Favorites
              </Link>
              <button onClick={logout}>
                Logout
              </button>
              <Link to="/Bio">
                Bio
              </Link>
              <Link to="/recipes">
                Recipes
              </Link>
              <Link to="/pantry">
                Pantry
              </Link>
              <Link to="/calendar">
                Meal Planner
              </Link>
              <SearchBar />

            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>
              <Link to="/signup">
                Signup
              </Link>
              <Link to="/Bio">
                Bio
              </Link>
              <Link to="/recipes">
                Recipes
              </Link>
            
            </>
            
          )
          }
        </div>
      </div>
    </header>
  );
};

export default Header;
