import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Link, useSearchParams } from "react-router-dom";
import "../css/Home.css";
import FilterModal from "../components/FilterModal";

const QUERY_ME = gql`
  query Query {
    me {
      _id
    }
  }
`;

const SEARCH_RECIPES = gql`
  query SearchRecipes($keywords: String!) {
    searchRecipes(keywords: $keywords) {
      id
      name
      image
    }
  }
`;

const ADD_RECIPE = gql`
  mutation AddRecipe($addRecipeId: Int!) {
    addRecipe(id: $addRecipeId) {
      pantry {
        id
        item
        quantity
        storage
        unit
      }
    }
  }
`;

const QUERY_PROFILES = gql`
  query Profiles {
    profiles {
      _id
      username
      recipes {
        id
        name
        image
      }
    }
  }
`;

const QUERY_PROFILE = gql`
  query Profile($profileId: ID!) {
    profile(profileId: $profileId) {
      recipes {
        id
        name
        image
        description
        ingredients {
          id
          item
          quantity
          unit
        }
        instructions {
          number
          step
          time
        }
      }
    }
  }
`;

interface Recipe {
  id: string;
  name: string;
  image: string;
}

const RecipeSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("query") || "";

  const { data: meData } = useQuery(QUERY_ME);
  const profileId = meData?.me?._id;

  const [addToFavorites] = useMutation(ADD_RECIPE, {
    refetchQueries: profileId
      ? [
          { query: QUERY_PROFILES },
          { query: QUERY_PROFILE, variables: { profileId } },
        ]
      : [],
    awaitRefetchQueries: true,
    onCompleted: (data) => console.log("Added to favorites:", data),
    onError: (error) => console.error("Error adding to favorites:", error),
  });

  const {
    loading: loadingRecipes,
    data: recipeData,
    error,
  } = useQuery(SEARCH_RECIPES, {
    variables: { keywords: queryParam },
    skip: queryParam.trim() === "",
  });

  const [modalOpen, setModalOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({
    sort: "random",
    expiringFirst: false,
    maxPrice: 100,
    maxCookTime: 180,
    dietary: [] as string[],
    mealType: "",
    cuisine: "",
    appliance: "",
    maxValue: 100,
  });

  function getRandomItems<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function filterRecipes(recipes: Recipe[]) {
    return recipes.filter((recipe) => {
      if (filters.maxPrice < 50 && recipe.name.toLowerCase().includes("steak"))
        return false;
      if (
        filters.mealType &&
        !recipe.name.toLowerCase().includes(filters.mealType)
      )
        return false;
      if (
        filters.cuisine &&
        !recipe.name.toLowerCase().includes(filters.cuisine)
      )
        return false;
      return true;
    });
  }

  function sortRecipes(recipes: Recipe[]) {
    switch (filters.sort) {
      case "name":
        return [...recipes].sort((a, b) => a.name.localeCompare(b.name));
      case "id":
        return [...recipes].sort((a, b) => a.id.localeCompare(b.id));
      case "random":
      default:
        return getRandomItems(recipes, 5);
    }
  }

  const recipes: Recipe[] = recipeData?.searchRecipes || [];
  const filtered = filterRecipes(recipes);
  const sorted = sortRecipes(filtered);

  return (
    <div className="homepage">
      <div className="top-bar">
        <button className="btn modal" onClick={() => setModalOpen(true)}>
          🔍 Filter & Sort
        </button>
      </div>

      <main className="content-grid">
        {loadingRecipes ? (
          <div className="box random-recipe">
            <h2>Recipes</h2>
            <p>Loading recipes...</p>
          </div>
        ) : error ? (
          <div className="box random-recipe">
            <h2>Recipes</h2>
            <p>Error loading recipes: {error.message}</p>
          </div>
        ) : sorted.length > 0 ? (
          sorted.map((recipe) => (
            <div className="box random-recipe" key={recipe.id}>
              <h2>{recipe.name}</h2>
              <Link to={`/recipes/${recipe.id}`}>
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="recipe-img"
                />
              </Link>
              <p>✅ Has all ingredients</p>
              <div className="button-group">
                <button
                  className="btn favorite"
                  onClick={() =>
                    addToFavorites({
                      variables: { addRecipeId: parseInt(recipe.id) },
                    })
                  }
                >
                  Add to Favorites
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="box random-recipe">
            <h2>Recipes</h2>
            <p>No recipes found with selected filters.</p>
          </div>
        )}
      </main>

      <FilterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setModalOpen(false);
        }}
        sortOption={filters.sort}
      />
    </div>
  );
};

export default RecipeSearch;
