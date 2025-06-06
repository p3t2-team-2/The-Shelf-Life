import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Error from "./pages/Error";
import Pantry from "./pages/Pantry";
import Bio from "./pages/Bio";
import Recipes from "./pages/Recipes";
import Calendar from "./pages/Calendar";
import Favorites from "./pages/Favorites";
import RecipeDetails from "./pages/fullRecipes";
import RecipeSearch from "./components/RecipeSearch.js";
import ShoppingList from "./pages/ShoppingList.js";
import ProtectedRedirect from "./components/ProtectedRedirect";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <ProtectedRedirect />, // <-- handles redirect logic
      },
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/pantry",
        element: <Pantry />,
      },
      {
        path: "/shoppinglist",
        element: <ShoppingList />,
      },
      {
        path: "/bio",
        element: <Bio />,
      },
      {
        path: "/recipes",
        element: <Recipes />,
      },
      {
        path: "/calendar",
        element: <Calendar />,
      },
      {
        path: "/favorites",
        element: <Favorites />,
      },
      {
        path: "/search",
        element: <RecipeSearch />,
      },
      {
        path: "/recipes/:recipeId",
        element: <RecipeDetails />,
      },
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
}
