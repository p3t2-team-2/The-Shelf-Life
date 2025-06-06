import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { QUERY_RECIPE } from '../utils/queries';
import '../css/fullRecipes.css';

interface Step {
  number: number;
  step: string;
  time?: string;
}

interface Ingredient {
  id: number;
  item: string;
  quantity: number;
  unit: string;
  storage?: string;
}

interface Recipe {
  id: number;
  name: string;
  description: string;
  image: string;
  ingredients: Ingredient[];
  instructions: Step[];
}

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

const ADD_TO_SHOPPING_LIST = gql`
  mutation AddToShoppingList($id: Int!) {
    addtoShoppingList(id: $id) {
      shoppingList {
        id
        item
        quantity
        unit
      }
    }
  }
`;

const COOK_RECIPE = gql`
  mutation CookRecipe($cookId: Int!) {
    cook(id: $cookId) {
      recipes {
        id
      }
    }
  }
`;

const RecipeDetails = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (message: string) => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalMessage('');
  };

  const { loading, error, data } = useQuery(QUERY_RECIPE, {
    variables: { recipeByIdId: parseInt(recipeId as string) },
    skip: !recipeId,
    fetchPolicy: 'no-cache',
  });

  const [addToRecipes] = useMutation(ADD_RECIPE, {
    variables: { addRecipeId: parseInt(recipeId as string) },
    onCompleted: (data) => {
      console.log('Recipe added:', data.addRecipe);
    },
    onError: (error) => {
      console.error('Error adding recipe:', error);
      showModal('❌ Failed to add recipe.');
    },
  });

  const [addtoShoppingList] = useMutation(ADD_TO_SHOPPING_LIST, {
    variables: { id: parseInt(recipeId as string) },
    onCompleted: () => {
      showModal('✅ Ingredients added to your shopping list!');
    },
    onError: (error) => {
      console.error('❌ Error adding to shopping list:', error);
      showModal('❌ Failed to add ingredients.');
    },
  });

  const [cookRecipe, { loading: cooking }] = useMutation(COOK_RECIPE, {
    variables: { cookId: parseInt(recipeId as string) },
    onCompleted: () => {
      showModal('✅ Successfully cooked! Your pantry has been updated.');
    },
    onError: (error) => {
      console.error('❌ Error cooking recipe:', error);
      showModal(`❌ Error: ${error.message}`);
    },
  });

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error loading recipe: {error.message}</p>;

  const recipe: Recipe = data.recipeById;

  const handleAddToRecipes = () => {
    addToRecipes();
  };

  const handleaddtoShoppingList = () => {
    addtoShoppingList();
  };

  const handleCook = () => {
    cookRecipe();
  };

  return (
    <div className="recipe-details">
      <h2>{recipe.name}</h2>
      <img src={recipe.image} alt={recipe.name} />
      <p dangerouslySetInnerHTML={{ __html: recipe.description }} />

      <h3>Ingredients</h3>
      <ul>
        {recipe.ingredients.map((ing) => (
          <li key={ing.id}>
            {`${ing.quantity} ${ing.unit} ${ing.item}`}
          </li>
        ))}
      </ul>

      <h3>Instructions</h3>
      <ol>
        {recipe.instructions.map((step) => (
          <li key={step.number}>
            <span dangerouslySetInnerHTML={{ __html: step.step }} />
            {step.time ? ` (${step.time})` : ''}
          </li>
        ))}
      </ol>

      <div className="button-group">
        <button className="add-recipe-button" onClick={handleAddToRecipes}>
          Add to Recipes
        </button>
        <button className="add-recipe-button" onClick={handleaddtoShoppingList}>
          🛒 Add Ingredients to Shopping List
        </button>
        <button
          className="add-recipe-button"
          onClick={handleCook}
          disabled={cooking}
        >
          {cooking ? 'Cooking...' : '🍳 Cook'}
        </button>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className='modal-message'>{modalMessage}</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetails;
