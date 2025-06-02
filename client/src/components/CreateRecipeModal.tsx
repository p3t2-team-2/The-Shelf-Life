import React from 'react';
import '../css/CreateRecipeModal.css';

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: { name: string; ingredients: string; instructions: string }) => void;
}

const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = React.useState({
    name: '',
    ingredients: '',
    instructions: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Your Recipe</h2>
        <input
          name="name"
          placeholder="Recipe Name"
          value={form.name}
          onChange={handleChange}
        />
        <textarea
          name="ingredients"
          placeholder="Ingredients (comma separated)"
          value={form.ingredients}
          onChange={handleChange}
        />
        <textarea
          name="instructions"
          placeholder="Instructions"
          value={form.instructions}
          onChange={handleChange}
        />
        <div className="modal-actions">
          <button onClick={() => onSave(form)}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipeModal;