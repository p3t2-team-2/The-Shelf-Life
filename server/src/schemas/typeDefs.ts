const typeDefs = `
  type Profile {
    _id: ID
    name: String
    email: String
    password: String
    recipes: [Recipe]
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

  type Recipe {
    id: ID!
    title: String!
    image: String
  }

  type Query {
    profiles: [Profile]!
    profile(profileId: ID!): Profile
    me: Profile

    
    spoonacularRecipes: [Recipe]!

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
  }

  type Mutation {
    addProfile(input: ProfileInput!): Auth
    login(email: String!, password: String!): Auth
    removeProfile: Profile
    
    addFavoriteRecipe(recipeId: ID!): Profile
    removeFavoriteRecipe(recipeId: ID!): Profile

    // addPantryItem(name: String!, quantity: Int!): Profile
    // removePantryItem(itemId: ID!): Profile
    // updatePantryItem(itemId: ID!, name: String, quantity: Int): Profile

    // Cook a meal and remove ingredients from pantry
    // cookMeal(recipeId: ID!): Profile
  }
`;

export default typeDefs;
