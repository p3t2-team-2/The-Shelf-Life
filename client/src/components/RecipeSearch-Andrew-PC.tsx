import { gql, useLazyQuery } from '@apollo/client';
import SearchBar from './SearchBar';

const SEARCH_RECIPES = gql`
  query SearchRecipes($query: String!) {
    searchRecipes(query: $query) {
      id
      title
      image
    }
  }
`;

const RecipeSearch = () => {
  const [searchRecipes, { data, loading, error }] = useLazyQuery(SEARCH_RECIPES);

  const handleSearch = (query: string) => {
    searchRecipes({ variables: { query } });
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      {loading && <p>Loading recipes...</p>}
      {error && <p>Error: {error.message}</p>}
      {data?.searchRecipes && (
        <ul>
          {data.searchRecipes.map((recipe) => (
            <li key={recipe.id}>
              <p>{recipe.title}</p>
              <img src={recipe.image} alt={recipe.title} width="150" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeSearch;
