import React, { useState } from 'react';
import '../css/Home.css';
import '../css/Modal.css';
import { gql, useQuery, useMutation } from '@apollo/client';

const QUERY_ME = gql`
  query Me {
    me {
      _id
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

const ADD_TO_PANTRY = gql`
  mutation Mutation($addtoPantryId: Int!, $storage: String!, $unit: String!, $quantity: Int!) {
    addtoPantry(id: $addtoPantryId, storage: $storage, unit: $unit, quantity: $quantity) {
      pantry {
        item
        quantity
        storage
        unit
        id
      }
    }
  }
`;

const Pantry: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [itemId, setItemId] = useState<number>(0);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('g');
  const [storageType, setStorageType] = useState('Fridge'); // matches options

  const { loading, data, refetch } = useQuery(QUERY_ME);
  const [addToPantry] = useMutation(ADD_TO_PANTRY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await addToPantry({
        variables: {
          addtoPantryId: itemId,
          quantity: Number(quantity),
          unit,
          storage: storageType,
        },
      });

      console.log('Added item:', result.data);
      await refetch();
      setShowModal(false);
      setItemId(0);
      setQuantity(1);
      setUnit('g');
      setStorageType('Fridge');
    } catch (error) {
      console.error('Error adding pantry item:', error);
    }
  };

  const pantryItems = data?.me?.pantry || [];
  const fridgeItems = pantryItems.filter((item: any) => item.storage === 'Fridge');
  const freezerItems = pantryItems.filter((item: any) => item.storage === 'Freezer');
  const closetItems = pantryItems.filter((item: any) => item.storage === 'Closet');

  return (
    <div className="homepage">
      <main className="content-grid">
        <div
          className="box filter-modal"
          style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <button className="btn modal" onClick={() => setShowModal(true)}>➕ Add Items to Pantry</button>
          <button className="btn modal">⚙️ Filter / Sort</button>
        </div>

        <div className="box">
          <h3>❄️ Fridge</h3>
          {fridgeItems.length === 0 ? <p>No fridge items.</p> : fridgeItems.map((item: any) => (
            <p key={item.id}>{item.item} (x{item.quantity} {item.unit})</p>
          ))}
        </div>

        <div className="box">
          <h3>🧊 Freezer</h3>
          {freezerItems.length === 0 ? <p>No freezer items.</p> : freezerItems.map((item: any) => (
            <p key={item.id}>{item.item} (x{item.quantity} {item.unit})</p>
          ))}
        </div>

        <div className="box">
          <h3>🧺 Closet Shelf</h3>
          {closetItems.length === 0 ? <p>No closet items.</p> : closetItems.map((item: any) => (
            <p key={item.id}>{item.item} (x{item.quantity} {item.unit})</p>
          ))}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add Item to Pantry</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Spoonacular Item ID:
                  <input type="number" value={itemId} onChange={(e) => setItemId(parseInt(e.target.value))} required />
                </label>
                <label>
                  Quantity:
                  <input type="number" value={quantity} min="1" onChange={(e) => setQuantity(parseInt(e.target.value))} />
                </label>
                <label>
                  Unit:
                  <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} />
                </label>
                <label>
                  Storage Type:
                  <select value={storageType} onChange={(e) => setStorageType(e.target.value)}>
                    <option>Fridge</option>
                    <option>Freezer</option>
                    <option>Closet</option>
                  </select>
                </label>
                <div className="modal-buttons">
                  <button type="submit" className="btn cook">Add</button>
                  <button type="button" className="btn favorite" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">(Pantry/Fridge Page)</footer>
    </div>
  );
};

export default Pantry;
