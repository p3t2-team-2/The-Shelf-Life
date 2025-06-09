import { gql } from '@apollo/client';

export const QUERY_PROFILES = gql`
  query allProfiles {
    profiles {
      _id
      name
    }
  }
`;

export const QUERY_SINGLE_PROFILE = gql`
  query singleProfile($profileId: ID!) {
    profile(profileId: $profileId) {
      _id
      name
    }
  }
`;

export const QUERY_ME = gql`
  query me {
    me {
      _id
      name
      recipes {
           name
           id
      }
      calendarMeals
    }
  }
`
export const QUERY_RECIPE = gql`
  query Query($recipeByIdId: Int!) {
  recipeById(id: $recipeByIdId) {
    description
    id
    image
    ingredients {
      id
      item
      quantity
      storage
      unit
    }
    instructions {
      number
      step
      time
    }
    name
  }
}
`
// export const  QUERY_INGREDIENT = gql`
  
// `
;
