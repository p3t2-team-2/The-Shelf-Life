import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../components/AlertModal';
import '../css/searchResults.css';

interface Recipe {
  id: number;
  name: string;
  image: string;
}

interface SearchResultsProps {
  results: Recipe[];
}

const ADD_RECIPE = gql`
  mutation AddRecipe($id: Int!) {
    addRecipe(id: $id) {
      _id
      recipes {
        id
        name
        image
      }
    }
  }
`;

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const [addRecipe, { loading }] = useMutation(ADD_RECIPE);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAddToFavorites = async (recipe: Recipe) => {
    try {
      await addRecipe({ variables: { id: recipe.id } });
      setAlertMessage(`${recipe.name} added to favorites!`);
    } catch (error: any) {
      setAlertMessage(`Failed to add ${recipe.name}: ${error.message}`);
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/recipes/${id}`);
  };

  return (
    <div className="search-results">
      {results.map((recipe) => (
        <div key={recipe.id} className="recipe-card">
          <img src={recipe.image} alt={recipe.name} />
          <h3>{recipe.name}</h3>
          <div className="card-buttons">
            <button
              onClick={() => handleViewDetails(recipe.id)}
              className="view-button"
            >
              View Recipe
            </button>
            <button
              onClick={() => handleAddToFavorites(recipe)}
              disabled={loading}
              className="favorite-button"
            >
              {loading ? 'Adding...' : 'Add to Favorites'}
            </button>
          </div>
        </div>
      ))}
      {alertMessage && (
        <AlertModal message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
    </div>
  );
};

export default SearchResults;
