import React, { useState } from 'react';
import '../css/Home.css';
import '../css/Modal.css';

const Pantry: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  // Pantry item state
  const [coldItems, setColdItems] = useState<string[]>([]);
  const [frozenItems, setFrozenItems] = useState<string[]>([]);
  const [ambientItems, setAmbientItems] = useState<string[]>([]);

  // Form inputs
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [storageType, setStorageType] = useState('Cold');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const item = `${itemName} (x${quantity || 1})`;

    if (storageType === 'Cold') setColdItems([...coldItems, item]);
    if (storageType === 'Frozen') setFrozenItems([...frozenItems, item]);
    if (storageType === 'Ambient') setAmbientItems([...ambientItems, item]);

    // Reset modal and inputs
    setShowModal(false);
    setItemName('');
    setQuantity('');
    setStorageType('Cold');
  };

  return (
    <div className="homepage">
      <main className="content-grid">
        {/* Top Controls */}
        <div
          className="box filter-modal"
          style={{
            gridColumn: 'span 3',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button className="btn modal" onClick={() => setShowModal(true)}>
            ➕ Add Items to Pantry
          </button>
          <button className="btn modal">⚙️ Filter / Sort</button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add Item to Pantry</h3>
              <form onSubmit={handleSubmit}>
                <label>
                  Item Name:
                  <input
                    type="text"
                    name="name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </label>
                <label>
                  Quantity:
                  <input
                    type="number"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </label>
                <label>
                  Storage Type:
                  <select
                    value={storageType}
                    onChange={(e) => setStorageType(e.target.value)}
                  >
                    <option>Cold</option>
                    <option>Frozen</option>
                    <option>Ambient</option>
                  </select>
                </label>
                <div className="modal-buttons">
                  <button type="submit" className="btn cook">
                    Add
                  </button>
                  <button
                    type="button"
                    className="btn favorite"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cold Stuff */}
        <div className="box">
          <h2>Cold Stuff</h2>
          <ul>
            {coldItems.length === 0 && <li>No items yet</li>}
            {coldItems.map((item, index) => (
              <li key={index}>{item} 🗑️</li>
            ))}
          </ul>
        </div>

        {/* Frozen Stuff */}
        <div className="box">
          <h2>Frozen Stuff</h2>
          <ul>
            {frozenItems.length === 0 && <li>No items yet</li>}
            {frozenItems.map((item, index) => (
              <li key={index}>{item} 🗑️</li>
            ))}
          </ul>
        </div>

        {/* Ambient Stuff */}
        <div className="box">
          <h2>Ambient Stuff</h2>
          <ul>
            {ambientItems.length === 0 && <li>No items yet</li>}
            {ambientItems.map((item, index) => (
              <li key={index}>{item} 🗑️</li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="footer">(Pantry/Fridge Page)</footer>
    </div>
  );
};

export default Pantry;
