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

    
    spoonacularRecipes: [Recipe]
  }

  type Mutation {
    addProfile(input: ProfileInput!): Auth
    addRecipe(id: Int!): Profile
    removeRecipe(id: Int!): Profile
    login(email: String!, password: String!): Auth
    removeProfile: Profile
    
  }
`;

export default typeDefs;
