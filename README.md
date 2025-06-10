ReadME:


md
# The Shelf Life

## Overview
**The Shelf Life** is a full-stack web application designed to simplify meal planning and ingredient management. Users can **search for recipes**, **add ingredients to a shopping list**, **move items to a pantry**, and **use a cook button to remove ingredients from the pantry** when preparing meals. Additionally, the app features a **weekly meal planner** that automatically generates a full week of meals.

## Features
- **Recipe Search:** Find favorite recipes using the Spoonacular API.
- **Shopping List Management:** Add ingredients from recipes to a shopping list.
- **Pantry System:** Move purchased ingredients from the shopping list to the pantry.
- **Cook Button:** Remove ingredients from the pantry when used in a meal.
- **Weekly Meal Planner:** Automatically generate a full **week of meals** with random selections.

## Technologies Used
- **Frontend:** React.js
- **Backend:** GraphQL & MongoDB
- **API Integration:** Spoonacular API
- **State Management:** Apollo Client / Context API

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/p3t2-team-2/The-Shelf-Life.git

Navigate to the project directory:
sh
cd The-Shelf-Life


Install dependencies:
sh
npm install


Set up environment variables (.env file):
REACT_APP_SPOONACULAR_API_KEY=your_api_key_here


Start the development server:
sh
npm start


Usage Guide
Search for Recipes: Enter keywords in the search bar to find dishes.
Add Ingredients to Shopping List: Click on a recipe to view ingredients, then add them to your list.
Move Items to Pantry: Once purchased, move items to the pantry for tracking.
Use Cook Button: When preparing a meal, remove ingredients from the pantry with a single click.
Generate Weekly Plan: Let the app suggest seven meals, filling out your meal planner automatically.
Challenges Faced
Efficient API Call Management to reduce unnecessary requests.
Retrieving & Storing Ingredients in JSON format and MongoDB.
Calendar Implementation for meal scheduling.
Successes
Streamlined Team Collaboration
Optimized Weekly Meal List Feature
Improved GraphQL Resolver Functionality
Screenshots / Demo
(Consider adding screenshots or a link to a live demo here)
Contributors
Backend Development: Doyle Martin / Andrew Cerna
Frontend Design & Development: Daniel Sisson / Christopher Del Grosso (CDG)
Future Enhancements
User Authentication for personalized meal planning.
Recipe Rating System based on user preferences.
Advanced Pantry Expiration Tracking to reduce waste.
License
This project is licensed under the MIT License.

