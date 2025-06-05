// import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
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
    addToShoppingList(id: $id) {
      shoppingList {
        id
        item
        quantity
        unit
      }
    }
  }
`;

const RecipeDetails = () => {
  const { recipeId } = useParams<{ recipeId: string }>();

  const { loading, error, data } = useQuery(QUERY_RECIPE, {
    variables: { recipeByIdId: parseInt(recipeId as string) },
    skip: !recipeId,
  });

  const [addToRecipes] = useMutation(ADD_RECIPE, {
    variables: { addRecipeId: parseInt(recipeId as string) },
    onCompleted: (data) => {
      console.log('Recipe added:', data.addRecipe);
    },
    onError: (error) => {
      console.error('Error adding recipe:', error);
    },
  });

  const [addToShoppingList] = useMutation(ADD_TO_SHOPPING_LIST, {
    variables: { id: parseInt(recipeId as string) },
    onCompleted: () => {
      alert('✅ Ingredients added to your shopping list!');
    },
    onError: (error) => {
      console.error('❌ Error adding to shopping list:', error);
      alert('Failed to add ingredients.');
    },
  });

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error loading recipe: {error.message}</p>;

  const recipe: Recipe = data.recipeById;

  const handleAddToRecipes = () => {
    addToRecipes();
  };

  const handleAddToShoppingList = () => {
    addToShoppingList();
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
        <button className="add-recipe-button" onClick={handleAddToShoppingList}>
          🛒 Add Ingredients to Shopping List
        </button>
      </div>
    </div>
  );
};

export default RecipeDetails;