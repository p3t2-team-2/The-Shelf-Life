import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const QUERY_ME = gql`
  query Me {
    me {
      shoppingList {
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
        item
        quantity
        unit
      }
    }
  }
`;

const ShoppingList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(QUERY_ME);
  const [clearShoppingList] = useMutation(CLEAR_SHOPPING_LIST);

  if (loading) return <p>Loading shopping list...</p>;
  if (error) return <p>Error loading shopping list.</p>;

  const items = data?.me?.shoppingList || [];

  const handleClear = async () => {
    try {
      await clearShoppingList();
      await refetch();
    } catch (err) {
      console.error("❌ Failed to clear shopping list:", err);
    }
  };

  return (
    <div className="shopping-list-page">
      <h1>🛒 Your Shopping List</h1>

      {items.length === 0 ? (
        <p>No items in your list.</p>
      ) : (
        <ul>
          {items.map((ing: any, index: number) => (
            <li key={index}>
              ✅ {ing.item}
              {ing.quantity && ` — ${ing.quantity}`}
              {ing.unit && ` ${ing.unit}`}
            </li>
          ))}
        </ul>
      )}

      {items.length > 0 && (
        <button onClick={handleClear} className="btn clear">
          Clear Shopping List
        </button>
      )}
    </div>
  );
};

export default ShoppingList;