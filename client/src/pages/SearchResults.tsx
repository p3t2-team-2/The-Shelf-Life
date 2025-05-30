import { useSearchParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import '../css/SearchResults.css'; 

type Recipe = {
  id: number;
  name: string;
  image: string;
};

const SEARCH_RECIPES = gql`
query SearchRecipes($keywords: String!) {
  searchRecipes(keywords: $keywords) {
    id
    image
    name
  }
}
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query");

  const { loading, error, data } = useQuery(SEARCH_RECIPES, {
    variables: { keywords: query || "" },
    skip: !query, 
  });

  const results: Recipe[] = data?.searchRecipes || [];



  return (
    <div className="search-results-page">
      <h2>Search Results for: <em>{query}</em></h2>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {!loading && !error && results.length === 0 && (
        <p>No recipes found for your query.</p>
      )}
      <div className="results-grid">
        {results.map((recipe) => (
          <div key={recipe.id} className="recipe-card">
            <img src={recipe.image} alt={recipe.name} />
            <p>{recipe.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
