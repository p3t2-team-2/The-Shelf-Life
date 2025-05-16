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

    
    spoonacularRecipes: [Recipe]
  }

  type Mutation {
    addProfile(input: ProfileInput!): Auth
    login(email: String!, password: String!): Auth
    removeProfile: Profile
    
  }
`;
export default typeDefs;
