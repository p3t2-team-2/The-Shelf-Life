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

interface Ingredient {
  id: number;
  item: string;
  quantity: number;
  unit: string;
}

const ShoppingList: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(QUERY_ME);
  const [clearShoppingList] = useMutation(CLEAR_SHOPPING_LIST);
  const [removeFromShoppingList] = useMutation(REMOVE_FROM_SHOPPING_LIST);

  if (loading) return <p>Loading shopping list...</p>;
  if (error) return <p>Error loading shopping list.</p>;

  const items: Ingredient[] = data?.me?.shoppingList || [];

  const handleClear = async () => {
  try {
    await clearShoppingList({
      update: (cache) => {
        cache.modify({
          fields: {
            me(existingMe = {}) {
              return {
                ...existingMe,
                shoppingList: [],
              };
            },
          },
        });
      },
    });
    await refetch();
    alert("🧼 Shopping list cleared.");
  } catch (err) {
    console.error("❌ Failed to clear shopping list:", err);
  }
};

  const handleRemove = async (id: number) => {
  try {
    await removeFromShoppingList({
      variables: { id },
      update: (cache) => {
        cache.modify({
          fields: {
            me(existingMe = {}) {
              const updatedList = (existingMe.shoppingList || []).filter(
                (item: Ingredient) => item.id !== id
              );
              return {
                ...existingMe,
                shoppingList: updatedList,
              };
            },
          },
        });
      },
    });
    await refetch();
  } catch (err) {
    console.error(`❌ Failed to remove item ${id}:`, err);
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
            <li key={ing.id} className="shopping-item">
              <span>
                ✅ <strong>{ing.item}</strong>
                {ing.quantity && ` — ${ing.quantity}`}
                {ing.unit && ` ${ing.unit}`}
              </span>
              <button
                onClick={() => handleRemove(ing.id)}
                className="btn remove"
              >
                🗑️
              </button>
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