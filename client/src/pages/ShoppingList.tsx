import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import "../css/ShoppingList.css";

const QUERY_ME = gql`
  query Me {
    me {
      shoppingList {
        id
        item
        quantity
        unit
      }
      pantry {
        id
        item
        quantity
        unit
      }
    }
  }
`;

const CLEAR_SHOPPING_LIST = gql`
  mutation {
    clearShoppingList {
      _id
      shoppingList {
        id
        item
        quantity
        unit
      }
    }
  }
`;

const REMOVE_FROM_SHOPPING_LIST = gql`
  mutation RemoveFromShoppingList($id: Int!) {
    removeFromShoppingList(id: $id) {
      _id
      shoppingList {
        id
        item
        quantity
        unit
      }
    }
  }
`;

const SHOPPING_LIST_TO_PANTRY = gql`
  mutation {
    shoppingListToPantry {
      _id
      pantry {
        id
        item
        quantity
        unit
      }
    }
  }
`;

interface Ingredient {
  id: number;
  item: string;
  quantity: number;
  unit: string;
}

const Modal: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <p>{message}</p>
      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

const ShoppingList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(QUERY_ME);
  const [clearShoppingList] = useMutation(CLEAR_SHOPPING_LIST);
  const [removeFromShoppingList] = useMutation(REMOVE_FROM_SHOPPING_LIST);
  const [shoppingListToPantry] = useMutation(SHOPPING_LIST_TO_PANTRY, {
    refetchQueries: [{ query: QUERY_ME }],
    awaitRefetchQueries: true,
  });

  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  if (loading) return <p>Loading shopping list...</p>;
  if (error) return <p>Error loading shopping list.</p>;

  const rawItems: Ingredient[] = data?.me?.shoppingList || [];

  const items = [...rawItems].sort((a, b) => {
    const aChecked = checkedItems.includes(a.id);
    const bChecked = checkedItems.includes(b.id);
    if (aChecked === bChecked) return 0;
    return aChecked ? 1 : -1;
  });

  const handleClear = async () => {
    try {
      await clearShoppingList();
      await refetch();
      setModalMessage("🧼 Shopping list cleared.");
    } catch (err) {
      console.error("❌ Failed to clear shopping list:", err);
      setModalMessage("❌ Failed to clear shopping list.");
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await removeFromShoppingList({ variables: { id } });
      await refetch();
    } catch (err) {
      console.error(`❌ Failed to remove item ${id}:`, err);
      setModalMessage("❌ Failed to remove item from shopping list.");
    }
  };

  const handleAddAllToPantry = async () => {
    if (items.length === 0) return setModalMessage("🛒 No items to move to pantry.");
    try {
      await shoppingListToPantry();
      await refetch();
      setModalMessage("📥 All shopping list items moved to pantry!");
    } catch (err) {
      console.error("❌ Failed to move items to pantry:", err);
      setModalMessage("❌ Could not complete pantry transfer.");
    }
  };

  return (
    <div className="shopping-list-page">
      <h1>🛒 Your Shopping List</h1>

      {items.length === 0 ? (
        <p className="shopping-items">No items in your list yet.</p>
      ) : (
        <ul className="shopping-items">
          {items.map((ing) => (
            <li
              key={ing.id}
              className={`shopping-item ${checkedItems.includes(ing.id) ? "checked" : ""}`}
            >
              <span onClick={() => toggleCheck(ing.id)} className="clickable-item">
                ✅ <strong>{ing.item}</strong>
                {ing.quantity && ` — ${ing.quantity}`}
                {ing.unit && ` ${ing.unit}`}
              </span>
              <button onClick={() => handleRemove(ing.id)} className="btn remove">
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <div className="bottom-buttons">
          <button onClick={handleClear} className="btn clear">
            🧺 Clear Shopping List
          </button>
          <button onClick={handleAddAllToPantry} className="btn pantry">
            📥 Add All to Pantry
          </button>
        </div>
      )}

      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage(null)} />}
    </div>
  );
};

export default ShoppingList;
