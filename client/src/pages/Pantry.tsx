import React, { useState } from 'react';
import '../css/Home.css';
import '../css/Modal.css';
import { gql, useQuery, useMutation } from '@apollo/client';

// GraphQL Queries and Mutations
const QUERY_PANTRY_ITEMS = gql`
  query GetPantryItems {
    pantryItems {
      _id
      name
      quantity
      storageType
    }
  }
`;

const ADD_PANTRY_ITEM = gql`
  mutation AddPantryItem($name: String!, $quantity: Int!, $storageType: String!) {
    addPantryItem(name: $name, quantity: $quantity, storageType: $storageType) {
      _id
      name
      quantity
      storageType
    }
  }
`;

const Pantry: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [storageType, setStorageType] = useState('Cold');

  const { loading, data, refetch } = useQuery(QUERY_PANTRY_ITEMS);
  const [addPantryItem] = useMutation(ADD_PANTRY_ITEM);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemName.trim()) return;

    try {
      const result = await addPantryItem({
        variables: {
          name: itemName,
          quantity: Number(quantity),
          storageType,
        },
      });

      console.log('Added item:', result.data);

      await refetch(); // ✅ Ensure UI updates after mutation
      setShowModal(false);
      setItemName('');
      setQuantity(1);
      setStorageType('Cold');
    } catch (error) {
      console.error('Error adding pantry item:', error);
    }
  };

  const coldItems = data?.pantryItems?.filter((item: any) => item.storageType === 'Cold') || [];
  const frozenItems = data?.pantryItems?.filter((item: any) => item.storageType === 'Frozen') || [];
  const ambientItems = data?.pantryItems?.filter((item: any) => item.storageType === 'Ambient') || [];

  return (
    <div className="homepage">
      <main className="content-grid">
        {/* Top Buttons */}
        <div className="box filter-modal" style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="btn modal" onClick={() => setShowModal(true)}>➕ Add Items to Pantry</button>
          <button className="btn modal">⚙️ Filter / Sort</button>
        </div>

        {/* Pantry Sections */}
        <div className="box">
          <h3>❄️ Fridge</h3>
          {coldItems.length === 0 ? <p>No cold items.</p> : coldItems.map((item: any) => (
            <p key={item._id}>{item.name} (x{item.quantity})</p>
          ))}
        </div>

        <div className="box">
          <h3>🧊 Freezer</h3>
          {frozenItems.length === 0 ? <p>No frozen items.</p> : frozenItems.map((item: any) => (
            <p key={item._id}>{item.name} (x{item.quantity})</p>
          ))}
        </div>

        <div className="box">
          <h3>🧺 Closet Shelf</h3>
          {ambientItems.length === 0 ? <p>No ambient items.</p> : ambientItems.map((item: any) => (
            <p key={item._id}>{item.name} (x{item.quantity})</p>
          ))}
        </div>

        {/* Modal for Adding Items */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add Item to Pantry</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Item Name:
                  <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
                </label>
                <label>
                  Quantity:
                  <input type="number" value={quantity} min="1" onChange={(e) => setQuantity(parseInt(e.target.value))} />
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
