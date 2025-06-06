import React from "react";
import { useQuery, gql, useMutation, useLazyQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import "../css/Home.css";
import FilterModal from "../components/FilterModal";
import { QUERY_PROFILES } from "../utils/queries";

const useInfiniteScroll = (callback: () => void) => {
  const loaderRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) callback();
      },
      { rootMargin: "100px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [callback]);

  return loaderRef;
};

const QUERY_ME = gql`
  query Query {
    me {
      _id
    }
  }
`;

const GET_SPOONACULAR_RECIPES = gql`
  query {
    spoonacularRecipes {
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

const GET_FILTERED_RECIPES = gql`
  query FilteredRecipes(
    $diet: String
    $intolerances: [String!]
    $maxReadyTime: String
    $equipment: [String!]
    $cuisine: [String!]
    $number: String
  ) {
    filteredRecipes(
      diet: $diet
      intolerances: $intolerances
      maxReadyTime: $maxReadyTime
      equipment: $equipment
      cuisine: $cuisine
      number: $number
    ) {
      id
      name
      image
    }
  }
`;

interface Recipe {
  id: string;
  name: string;
  image: string;
}

const Home: React.FC = () => {
  const { data: meData } = useQuery(QUERY_ME);
  const profileId = meData?.me?._id;

  const [addToFavorites] = useMutation(ADD_RECIPE, {
    refetchQueries: profileId
      ? [
          { query: QUERY_PROFILES },
          {
            query: gql`
              query Query($profileId: ID!) {
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
            `,
            variables: { profileId },
          },
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
  } = useQuery(GET_SPOONACULAR_RECIPES);

  const [loadFilteredRecipes, { data: filteredRecipesData, loading: filteredLoading }] =
    useLazyQuery(GET_FILTERED_RECIPES);

  const [itemsToLoad, setItemsToLoad] = React.useState(40);
  const loadMore = () => {
    setItemsToLoad((prev) => {
      const next = prev + 20;

      if (filteredRecipesData) {
        loadFilteredRecipes({
          variables: {
            diet: filters.dietary[0] || "",
            intolerances: filters.dietary,
            maxReadyTime: String(filters.maxCookTime),
            equipment: filters.appliance ? [filters.appliance] : [],
            cuisine: filters.cuisine ? [filters.cuisine] : [],
            number: String(next),
          },
        });
      }

      return next;
    });
  };

  const loaderRef = useInfiniteScroll(loadMore);

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
        return getRandomItems(recipes, itemsToLoad);
    }
  }

  const allRecipes: Recipe[] = filteredRecipesData?.filteredRecipes || recipeData?.spoonacularRecipes || [];
  const filtered = filterRecipes(allRecipes);
  const sorted = sortRecipes(filtered);

  return (
    <div className="homepage">
      <div className="top-bar">
        <button className="btn modal" onClick={() => setModalOpen(true)}>
          🔍 Filter & Sort
        </button>
      </div>

      <main className="content-grid">
        {loadingRecipes || filteredLoading ? (
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

      <div
        ref={loaderRef}
        style={{ height: 40, textAlign: "center", margin: "2rem auto" }}
      >
        {(loadingRecipes || filteredLoading) && <p>Loading more recipes...</p>}
      </div>

      <FilterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setModalOpen(false);

          const hasFilters =
            newFilters.dietary.length === 0 &&
            newFilters.mealType === "" &&
            newFilters.cuisine === "" &&
            newFilters.appliance === "" &&
            newFilters.maxCookTime === 180 &&
            newFilters.sort === "random";

          if (!hasFilters) {
            loadFilteredRecipes({
              variables: {
                diet: newFilters.dietary[0] || "",
                intolerances: newFilters.dietary,
                maxReadyTime: String(newFilters.maxCookTime),
                equipment: newFilters.appliance ? [newFilters.appliance] : [],
                cuisine: newFilters.cuisine ? [newFilters.cuisine] : [],
                number: String(itemsToLoad),
              },
            });
          }
        }}
        sortOption={filters.sort}
      />
    </div>
  );
};

export default Home;
