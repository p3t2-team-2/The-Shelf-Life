const typeDefs = `
  type Profile {
    _id: ID
    name: String
    email: String
    password: String
    pantry: [Ingredient]
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
  type Ingredient {
    id: Int
    item: String
    quantity: Int
    unit: String
    storage: String
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
    addRecipe(id: Int!): Profile
    removeRecipe(id: Int!): Profile
    login(email: String!, password: String!): Auth
    removeProfile: Profile
    addtoPantry(id: Int!, storage: String!, unit: String!, quantity: Int!): Profile
    increasePantryItem(id: Int!, quantity: Int!, unit: String!): Profile
    decreasePantryItem(id: Int!, quantity: Int!, unit: String!): Profile
    removeFromPantry(id: Int!): Profile
  }
`;

export default typeDefs;
