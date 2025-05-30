import db from '../config/connection.js';
import { Profile } from '../models/index.js';
import profileSeeds from './profileData.json' with { type: "json" };
import { SpoonIngredient } from '../models/index.js';
import allIngredients from './all_ingredients.json' with { type: "json" };
import cleanDB from './cleanDB.js';


const seedDatabase = async (): Promise<void> => {
  try {
    await db();
    await cleanDB();
    for (const profile of profileSeeds) {
      await Profile.create(profile);
    }
    for (const spoonIngredient of allIngredients) {
      await SpoonIngredient.create({
        id: spoonIngredient.id,
        item: spoonIngredient.item
      });
    }


    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error seeding database:', error.message);
    } else {
      console.error('Unknown error seeding database');
    }
    process.exit(1);
  }
};

seedDatabase();
