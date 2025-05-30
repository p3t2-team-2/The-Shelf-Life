import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Get_Recipe } from '../graphql/queries';

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

const RecipeDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { loading, error, data } = useQuery(GET_RECIPE, {
    variables: { id },
    skip: !id,
  });

  if (loading) return <p>Loading recipe...</p>;
  if (error) return <p>Error loading recipe: {error.message}</p>;

  const recipe: Recipe = data.recipe;

  return (
    <div className="recipe-details">
      <h2>{recipe.name}</h2>
      <img src={recipe.image} alt={recipe.name} />
      <p>{recipe.description}</p>

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
          <li key={step.number}>{step.step}</li>
        ))}
      </ol>
    </div>
  );
};

export default RecipeDetails;