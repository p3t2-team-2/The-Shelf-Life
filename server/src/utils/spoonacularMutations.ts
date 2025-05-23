import axios from 'axios';
import { Profile } from '../models';
// import { AuthenticationError } from 'apollo-server-express';

// export const addFavoriteRecipe = async (_parent: any, { recipe }: any, context: any) => {
//   if (!context.user) throw new AuthenticationError('Not authenticated');
//   return await Profile.findByIdAndUpdate(
//     context.user._id,
//     { $addToSet: { recipes: recipe } },
//     { new: true }
//   );
// }

// finish this next time