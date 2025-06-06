import React from "react";
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

interface Ingredient {
  id: number;
  item: string;
  quantity: number;
  unit: string;
}

const ShoppingList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(QUERY_ME);
  const [clearShoppingList] = useMutation(CLEAR_SHOPPING_LIST);

  if (loading) return <p>Loading shopping list...</p>;
  if (error) return <p>Error loading shopping list.</p>;

  const items: Ingredient[] = data?.me?.shoppingList || [];

  const handleClear = async () => {
    try {
      await clearShoppingList();
      await refetch();
      alert("🧼 Shopping list cleared.");
    } catch (err) {
      console.error("❌ Failed to clear shopping list:", err);
    }
  };

  return (
    <div className="shopping-list-page">
      <h1>🛒 Your Shopping List</h1>

      {items.length === 0 ? (
        <p>No items in your list yet.</p>
      ) : (
        <ul className="shopping-items">
          {items.map((ing) => (
            <li key={ing.id}>
              ✅ <strong>{ing.item}</strong>
              {ing.quantity && ` — ${ing.quantity}`}
              {ing.unit && ` ${ing.unit}`}
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <button onClick={handleClear} className="btn clear">
          🧺 Clear Shopping List
        </button>
      )}
    </div>
  );
};

export default ShoppingList;