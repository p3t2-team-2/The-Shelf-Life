import React, { useState } from 'react';
import '../css/Pantry.css';
import { gql, useQuery, useMutation } from '@apollo/client';

const QUERY_ME = gql`
  query Me {
    me {
      pantry {
        id
        item
        quantity
        unit
        storage
      }
    }
  }
`;

const QUERY_INGREDIENTS = gql`
  query Ingredients($keyword: String!) {
    ingredients(keyword: $keyword) {
      item
      id
    }
  }
`;

const ADD_TO_PANTRY = gql`
  mutation Mutation($addtoPantryId: Int!, $storage: String!, $unit: String!, $quantity: Int!) {
    addtoPantry(id: $addtoPantryId, storage: $storage, unit: $unit, quantity: $quantity) {
      pantry {
        id
        item
        quantity
        storage
        unit
      }
    }
  }
`;

const GET_INGREDIENT_UNITS = gql`
  query Query($ingredientByIdId: Int!) {
    ingredientById(id: $ingredientByIdId) {
      unit
    }
  }
`;

const Pantry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItemName, setSelectedItemName] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('g');
  const [storageType, setStorageType] = useState('Fridge');

  const { data: userData, refetch } = useQuery(QUERY_ME);
  const { data: searchData } = useQuery(QUERY_INGREDIENTS, {
    variables: { keyword: searchTerm },
    skip: searchTerm.length < 2,
  });

  const { data: unitData } = useQuery(GET_INGREDIENT_UNITS, {
    variables: { ingredientByIdId: selectedItemId },
    skip: !selectedItemId,
  });

  const [addToPantry] = useMutation(ADD_TO_PANTRY, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (error) => console.error('Error adding item to pantry:', error),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !selectedItemName) return;

    try {
      await addToPantry({
        variables: {
          addtoPantryId: selectedItemId,
          storage: storageType,
          unit,
          quantity,
        },
      });
    } catch (err) {
      console.error('Add error:', err);
    }
  };

  const handleIngredientSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    setSelectedItemName(selectedName);
    const selected = searchData?.ingredients.find((item: any) => item.item === selectedName);
    if (selected) {
      setSelectedItemId(parseInt(selected.id));
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedItemName('');
    setSelectedItemId(null);
    setQuantity(1);
    setUnit('');
  };

  const pantryItems = userData?.me?.pantry || [];

  return (
    <div className="pantry-page">
      <h2>Pantry Inventory</h2>

      <form className="pantry-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchData?.ingredients && (
          <select value={selectedItemName} onChange={handleIngredientSelection} required>
            <option value="">Select Ingredient</option>
            {searchData.ingredients.map((item: any, index: number) => (
              <option key={index} value={item.item}>
                {item.item}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
          required
        />
        {unitData?.ingredientById?.unit?.length > 0 ? (
          <select value={unit} onChange={(e) => setUnit(e.target.value)} required>
            <option value="">Select Unit</option>
            {unitData.ingredientById.unit.map((u: string, i: number) => (
              <option key={i} value={u}>{u}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Unit (e.g., g)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
        )}
        <select value={storageType} onChange={(e) => setStorageType(e.target.value)}>
          <option value="Fridge">Fridge</option>
          <option value="Freezer">Freezer</option>
          <option value="Closet">Closet</option>
        </select>
        <button type="submit">➕ Add to Pantry</button>
      </form>

      <div className="pantry-list">
        {pantryItems.map((item: any) => (
          <div key={item.id} className="pantry-item">
            <p><strong>{item.item}</strong></p>
            <p>Qty: {item.quantity} {item.unit}</p>
            <p>Storage: {item.storage}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pantry;