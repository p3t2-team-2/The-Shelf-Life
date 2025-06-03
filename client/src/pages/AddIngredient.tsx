// import React, { useState } from 'react';
// import { gql, useQuery, useMutation } from '@apollo/client';
// import { useParams } from 'react-router-dom';
// import { QUERY_INGREDIENT } from '../utils/queries';

// interface Ingredient {
//   id: number;
//   item: string;
//   quantity: number;
//   unit: string; 
//   storage?: string;
// }

// const RecipeDetails = () => {
//   const { ingredientId } = useParams<{ ingredientId: string }>();
//   console.log('Recipe ID from params:', ingredientId);
//   const { loading, error, data } = useQuery(QUERY_INGREDIENT, {
//     variables: { recipeByIdId: parseInt(ingredientId as string) },
//     skip: !ingredientId,
//   });

//   if (loading) return <p>Loading recipe...</p>;
//   if (error) return <p>Error loading recipe: {error.message}</p>;

//   const ingredient: Ingredient =  data.;
//   console.log('Recipe data:', recipe);

//   return (
//    <div className="recipe-details">
//       <h2>{recipe.name}</h2>
//       <img src={recipe.image} alt={recipe.name} />
//       <p>{recipe.description}</p>
//       <h3>Ingredients</h3>
//       <ul>
//         {recipe.ingredients.map((ing) => (
//           <li key={ing.id}>
//             {`${ing.quantity} ${ing.unit} ${ing.item}`}
//           </li>
//         ))}
//       </ul>
//       <h3>Instructions</h3>
//       <ol>
//         {recipe.instructions.map((step) => (
//           <li key={step.number}>
//             {step.step} {step.time ? `(${step.time})` : ''}
//           </li>
//         ))}
//       </ol>
//    </div>
//   );
// };

// export default RecipeDetails; 