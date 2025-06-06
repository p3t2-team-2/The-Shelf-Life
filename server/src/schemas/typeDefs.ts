const typeDefs = `
scalar JSON 

  type Profile {
    _id: ID
    name: String
    email: String
    password: String
    pantry: [Ingredient]
    recipes: [Recipe]
    calendarMeals: JSON
  }
  type SpoonIngredient {
    id: Int!
    item: String!
    unit: [String!]!
  }

  type Auth {
    token: ID!
    profile: Profile
  }

  input ProfileInput {
    name: String!
    email: String!
    password: String!
  }
  type Ingredient {
    id: Int
    item: String
    quantity: Float
    unit: String!
    storage: String
  }

  input IngredientUnits {
    id: Int
    item: String
    unit: [String]
    }
  
  type Step {
    number: Int
    step: String
    time: String
  }

  type Recipe {
    id: ID!
    name: String!
    description: String
    image: String
    ingredients: [Ingredient]
    instructions: [Step]
  }

  type Query {
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    me: Profile
    ingredients(keyword: String!): [SpoonIngredient]!
    spoonacularRecipes: [Recipe]!
    searchRecipes(keywords: String!): [Recipe]!
    recommendedRecipes: [Recipe]!
    recipeById(id: Int!): Recipe
    ingredientById(id: Int!): SpoonIngredient
    filteredRecipes(diet: String, intolerances: [String], maxReadyTime: String, equipment: [String], cuisine: [String], number: String): [Recipe]!
  }

  type Mutation {
    addProfile(input: ProfileInput!): Auth
    addRecipe(id: Int!): Profile
    removeRecipe(id: Int!): Profile
    login(email: String!, password: String!): Auth
    removeProfile: Profile
    addtoPantry(id: Int!, storage: String!, unit: String!, quantity: Int!): Profile
    increasePantryItem(id: Int!, quantity: Int!, unit: String!): Profile
    decreasePantryItem(id: Int!, quantity: Int!, unit: String!): Profile
    removeFromPantry(id: Int!): Profile
    addtoPantryByName(name: String!, storage: String!, unit: String!, quantity: Int!): Profile
    cook(id: Int!): Profile
    addNewIngredientsToPantry(item: String!, storage: String!, unit: [String!], quantity: Int!): Profile
    saveMealToDate(date: String!, meal: String!): Profile
    generateMeals(year: Int!, month: Int!): Profile
    removeMealFromDate(date: String!, index: Int!): Profile
  }
`;

// Get favorite recipes for the logged-in user?
// favoriteRecipes: [Recipe]!

// Get all items currently in pantry?
// allPantryItems: [PantryItem]!
// Get refrigerated items in pantry?
// allRefrigeratedItems: [PantryItem]!
// Get frozen items in pantry?
// allFrozenItems: [PantryItem]!
// Get dry goods in pantry?
// allDryGoods: [PantryItem]!
export default typeDefs;
