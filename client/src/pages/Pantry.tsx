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
  mutation addtoPantry($id: Int!, $quantity: Float!, $unit: String!, $storage: String!) {
    addtoPantry(id: $id, quantity: $quantity, unit: $unit, storage: $storage) {
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

const Pantry: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [itemId, setItemId] = useState<number>(0); 
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('g');
  const [storageType, setStorageType] = useState('Cold');

  const { loading, data, refetch } = useQuery(QUERY_ME);
  const [addToPantry] = useMutation(ADD_TO_PANTRY);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!itemId || itemId === 0) {
    alert("Please enter a valid Spoonacular Item ID.");
    return;
  }

  try {
    const result = await addToPantry({
      variables: {
        id: itemId,
        quantity: Number(quantity),
        unit,
        storage: storageType,
      },
    });

    if (!result.data) {
      alert("Something went wrong while adding the item.");
    } else {
      console.log('Added item:', result.data);
    }

    await refetch();
    setShowModal(false);
    setItemId(0);
    setQuantity(1);
    setUnit('g');
    setStorageType('Cold');
  } catch (error) {
    console.error('Error adding pantry item:', error);
  }
};

  const pantryItems = data?.me?.pantry || [];
  const coldItems = pantryItems.filter((item: any) => item.storage === 'Cold');
  const frozenItems = pantryItems.filter((item: any) => item.storage === 'Frozen');
  const ambientItems = pantryItems.filter((item: any) => item.storage === 'Ambient');

  return (
    <div className="homepage">
      <main className="content-grid">
        <div className="box filter-modal" style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn modal" onClick={() => setShowModal(true)}>➕ Add Items to Pantry</button>
          <button className="btn modal">⚙️ Filter / Sort</button>
        </div>

        <div className="box">
          <h3>❄️ Fridge</h3>
          {coldItems.length === 0 ? <p>No cold items.</p> : coldItems.map((item: any) => (
            <p key={item.id}>{item.item} (x{item.quantity} {item.unit})</p>
          ))}
        </div>

        <div className="box">
          <h3>🧊 Freezer</h3>
          {frozenItems.length === 0 ? <p>No frozen items.</p> : frozenItems.map((item: any) => (
            <p key={item.id}>{item.item} (x{item.quantity} {item.unit})</p>
          ))}
        </div>

        <div className="box">
          <h3>🧺 Closet Shelf</h3>
          {ambientItems.length === 0 ? <p>No ambient items.</p> : ambientItems.map((item: any) => (
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
                    <option>Cold</option>
                    <option>Frozen</option>
                    <option>Ambient</option>
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
