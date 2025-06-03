import React from 'react';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import '../css/CreateRecipeModal.css';

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: {
    name: string;
    ingredients: string[];
    instructions: string;
  }) => void;
}

const QUERY_INGREDIENTS = gql`
  query Ingredients($keyword: String!) {
    ingredients(keyword: $keyword) {
      item
      id
    }
  }
`;

const ADD_RECIPE = gql`
  mutation AddRecipe($id: Int!) {
    addRecipe(id: $id) {
      _id
      recipes {
        id
        name
        image
      }
    }
  }
`;

const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = React.useState({
    name: '',
    instructions: '',
  });

  const [ingredientInput, setIngredientInput] = React.useState('');
  const [ingredientList, setIngredientList] = React.useState<string[]>([]);
  const [successMessage, setSuccessMessage] = React.useState('');

  const [getSuggestions, { data: suggestionData }] = useLazyQuery(QUERY_INGREDIENTS);
  const [addRecipe] = useMutation(ADD_RECIPE);

  React.useEffect(() => {
    if (ingredientInput.trim()) {
      getSuggestions({ variables: { keyword: ingredientInput } });
    }
  }, [ingredientInput]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = (ingredient: string) => {
    if (!ingredientList.includes(ingredient)) {
      setIngredientList((prev) => [...prev, ingredient]);
    }
    setIngredientInput('');
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredientList((prev) => prev.filter((i) => i !== ingredient));
  };

  const handleSave = async () => {
    if (!form.name || !form.instructions || ingredientList.length === 0) {
      alert('Please fill out all fields and add at least one ingredient.');
      return;
    }

    const newRecipe = {
      name: form.name,
      ingredients: ingredientList,
      instructions: form.instructions,
    };

    // Trigger external save handler (e.g. saving to a recipe database)
    onSave(newRecipe);

    // Simulate getting an ID for the new recipe (replace this with real ID logic)
    const fakeRecipeId = Math.floor(Math.random() * 100000);

    try {
      await addRecipe({ variables: { id: fakeRecipeId } });
      setSuccessMessage('✅ Recipe added to your favorites!');
    } catch (err) {
      console.error('Failed to add to favorites:', err);
      setSuccessMessage('❌ Failed to add to favorites.');
    }

    // Optionally reset the form
    setForm({ name: '', instructions: '' });
    setIngredientList([]);
    setIngredientInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Your Recipe</h2>
        <input
          name="name"
          placeholder="Recipe Name"
          value={form.name}
          onChange={handleFormChange}
        />

        <div className="ingredient-section">
          <input
            name="ingredientInput"
            placeholder="Add Ingredient"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
          />
          {ingredientInput && suggestionData?.ingredients?.length > 0 && (
            <ul className="suggestions-list">
              {suggestionData.ingredients.map((ing: { item: string; id: string }) => (
                <li
                  key={ing.id}
                  onClick={() => handleAddIngredient(ing.item)}
                  className="suggestion-item"
                >
                  {ing.item}
                </li>
              ))}
            </ul>
          )}
          <div className="ingredient-list">
            {ingredientList.map((ing) => (
              <span key={ing} className="ingredient-tag">
                {ing}
                <button onClick={() => handleRemoveIngredient(ing)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <textarea
          name="instructions"
          placeholder="Instructions"
          value={form.instructions}
          onChange={handleFormChange}
        />

        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="modal-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipeModal;
