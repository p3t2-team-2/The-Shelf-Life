import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.jsx';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Error from './pages/Error';
import Pantry from './pages/Pantry';
import Bio from './pages/Bio';
import Recipes from './pages/Recipes';
import Calendar from './pages/Calendar';
import Favorites from './pages/Favorites';
import SearchResults from './pages/SearchResults';
import RecipeDetails from './pages/fullRecipes';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Home />
      }, {
        path: '/login',
        element: <Login />
      }, {
        path: '/signup',
        element: <Signup />
      },        
      {
        path: '/profile',
        element: <Profile />
      }, {
        path: '/pantry',
        element: <Pantry />
      }, {
        path: '/bio',
        element: <Bio />
      }, {
        path: '/recipes',
        element: <Recipes />
      }, {
        path: "/calendar",
        element: <Calendar />
      }, {
        path: "/favorites",
        element: <Favorites />
      }, {
        path: "/search",
        element: <SearchResults />
      }, {
        path: "/recipes",
        element: <Recipes />
      }
    ]
  },
]);

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
}
