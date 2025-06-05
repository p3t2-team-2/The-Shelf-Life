import fetch from "node-fetch";

export const getIngredientInfoByName = async (ingredientName: string) => {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    throw new Error("Spoonacular API key is not set in environment variables.");
  }
  const searchResults = await fetch(
    `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
      ingredientName
    )}&amount=1&apiKey=${apiKey}`
  );
  const searchData = await searchResults.json();
  if (!searchData?.results?.length) return null;
  const ingredientId = searchData.results[0].id;
  const infoResults = await fetch(
    `https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=1apiKey=${apiKey}`
  );
  const infoData = await infoResults.json();
  return {
    id: infoData.id,
    name: infoData.name,
    image: infoData.image,
    unit: infoData.unit,
  };
};
