import React, { useState } from 'react';
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
  mutation Mutation($addRecipeId: Int!) {
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

const RecipeDetails = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  console.log('Recipe ID from params:', recipeId);
  const { loading, error, data } = useQuery(QUERY_RECIPE, {
    variables: { recipeByIdId: parseInt(recipeId as string) },
    skip: !recipeId,
  });
  const [ addToRecipes ] = useMutation(ADD_RECIPE, {
      variables: { addRecipeId: parseInt(data?.recipeById?.id) },
      onCompleted: (data) => {
        console.log('Recipe added:', data.addRecipe);
      },
      onError: (error) => {
        console.error('Error adding recipe:', error);
      }
    });

  
  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error loading recipe: {error.message}</p>;

  const recipe: Recipe =  data.recipeById;
  console.log('Recipe data:', recipe);

  const handleAddToRecipes = () => {
    addToRecipes()
  };


  return (
   <div className="recipe-details">
      <h2>{recipe.name}</h2>
      <img src={recipe.image} alt={recipe.name} />
      <p dangerouslySetInnerHTML={{ __html: recipe.description }}/>
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
            {step.step} {step.time ? `(${step.time})` : ''}
          </li>
        ))}
      </ol>
      <button 
        className="add-recipe-button" 
        onClick={() => handleAddToRecipes()}
      >
        Add to Recipes
      </button>
      
   </div>
  );
};

export default RecipeDetails; 
    