import { IRecipe } from "../models/Recipe";

export const transformRecipe = (apiRecipe: any): IRecipe => {
  return {
    id: apiRecipe.id,
    name: apiRecipe.title || "No name provided",
    description: (apiRecipe.summary || "No description").replace(/<[^>]*>?/gm, ""),
    image: apiRecipe.image || "",
    ingredients: (apiRecipe.extendedIngredients || []).map((ing: any) => ({
      id: ing.id || 0,
      item: ing.name || "",
      quantity: ing.amount || 0,
      unit: ing.unit || "",
      storage: "", // your model requires this even if it's empty
    })),
    instructions: (apiRecipe.analyzedInstructions?.[0]?.steps || []).map((step: any) => ({
      number: step.number || 0,
      step: step.step || "",
      time: step.time || "" // Spoonacular doesn’t provide step time
    })),
  };
};
