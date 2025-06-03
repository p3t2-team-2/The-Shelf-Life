import { gql, useLazyQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const SEARCH_RECIPES = gql`
  query SearchRecipes($keywords: String!) {
    searchRecipes(keywords: $keywords) {
      id
      image
      name
    }
  }
`;

type Recipe = {
  id: number;
  name: string;
  image: string;
};

const RecipeSearch = () => {
  const [searchParams] = useSearchParams();
  const [searchRecipes, { data, loading, error }] = useLazyQuery(SEARCH_RECIPES);

  useEffect(() => {
    const query = searchParams.get("query");
    if (query) {
      searchRecipes({ variables: { keywords: query } });
    }
  }, [searchParams, searchRecipes]);

  return (
    <div>
      <h2>Search Results</h2>
      {loading && <p>Loading recipes...</p>}
      {error && <p>Error: {error.message}</p>}
      {data?.searchRecipes && (
        <ul>
          {data.searchRecipes.map((recipe: Recipe) => (
            <li key={recipe.id}>
              <p>{recipe.name}</p>
              <img src={recipe.image} alt={recipe.name} width="150" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeSearch;
