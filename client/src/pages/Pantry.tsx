import React, { useState } from "react";
import "../css/Pantry.css";
import { gql, useQuery, useMutation } from "@apollo/client";

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
  mutation AddToPantry(
    $addtoPantryId: Int!
    $storage: String!
    $unit: String!
    $quantity: Int!
  ) {
    addtoPantry(
      id: $addtoPantryId
      storage: $storage
      unit: $unit
      quantity: $quantity
    ) {
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

const REMOVE_FROM_PANTRY = gql`
  mutation RemoveFromPantry($pantryItemId: Int!) {
    removeFromPantry(id: $pantryItemId) {
      id
    }
  }
`;

const GET_INGREDIENT_UNITS = gql`
  query GetIngredientUnits($ingredientByIdId: Int!) {
    ingredientById(id: $ingredientByIdId) {
      unit
    }
  }
`;

const Pantry: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("");
  const [storageType, setStorageType] = useState("Fridge");

  const { data: userData, refetch } = useQuery(QUERY_ME);
  const { data: searchData } = useQuery(QUERY_INGREDIENTS, {
    variables: { keyword: searchTerm },
    skip: searchTerm.length < 2,
  });

  const { data: unitData } = useQuery(GET_INGREDIENT_UNITS, {
    variables: { ingredientByIdId: selectedItemId },
    skip: !selectedItemId,
  });

  console.log(unitData, "unitData");
  console.log(selectedItemId, "selectedItemId");

  const [addToPantry] = useMutation(ADD_TO_PANTRY, {
    onCompleted: () => {
      refetch();
      resetForm();
    },
    onError: (error) => console.error("Add error:", error),
  });

  const [removeFromPantry] = useMutation(REMOVE_FROM_PANTRY, {
    onCompleted: () => refetch(),
    onError: (error) => console.error("Remove error:", error),
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !selectedItemName) return;

    await addToPantry({
      variables: {
        addtoPantryId: selectedItemId,
        storage: storageType,
        unit,
        quantity,
      },
    });
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedItemName("");
    setSelectedItemId(null);
    setQuantity(1);
    setUnit("");
  };

  const pantryItems = userData?.me?.pantry || [];

  const fridgeItems = pantryItems.filter(
    (item: any) => item.storage === "Fridge"
  );
  const freezerItems = pantryItems.filter(
    (item: any) => item.storage === "Freezer"
  );
  const closetItems = pantryItems.filter(
    (item: any) => item.storage === "Closet"
  );

  // const unitOptions = unitData?.ingredientById?.unit;
  // const normalizedUnits = Array.isArray(unitOptions)
  //   ? unitOptions
  //   : typeof unitOptions === "string"
  //   ? [unitOptions]
  //   : [];

  return (
    <div className="pantry-page">
      <h2>Pantry Inventory</h2>

      <form className="pantry-form" onSubmit={handleAdd}>
        <div className="autocomplete-wrapper">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={selectedItemName || searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedItemName("");
              setSelectedItemId(null);
              setUnit("");
            }}
            autoComplete="off"
          />
          {searchData?.ingredients && searchTerm.length >= 2 && (
            <ul className="suggestion-list">
              {searchData.ingredients.map((item: any) => (
                <li
                  key={item.id}
                  className="suggestion-item"
                  onClick={() => {
                    setSelectedItemName(item.item);
                    setSelectedItemId(parseInt(item.id));
                    setSearchTerm("");
                    setUnit("");
                  }}
                >
                  {item.item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
          required
        />

        {(() => {
          const unitOptions = unitData?.ingredientById?.unit;
          const normalizedUnits = Array.isArray(unitOptions)
            ? unitOptions
            : typeof unitOptions === "string"
            ? [unitOptions]
            : [];

          return normalizedUnits.length > 0 ? (
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            >
              <option value="">Select Unit</option>
              {normalizedUnits.map((u: string, i: number) => (
                <option key={i} value={u}>
                  {u}
                </option>
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
          );
        })()}

        <select
          value={storageType}
          onChange={(e) => setStorageType(e.target.value)}
        >
          <option value="Fridge">Fridge</option>
          <option value="Freezer">Freezer</option>
          <option value="Closet">Closet</option>
        </select>

        <button type="submit">➕ Add to Pantry</button>
      </form>

      <div className="pantry-list">
        <h3>🧊 Fridge</h3>
        {fridgeItems.length ? (
          fridgeItems.map((item: any) => (
            <div key={item.id} className="pantry-item">
              <p>
                <strong>{item.item}</strong>
              </p>
              <p>
                Qty: {item.quantity} {item.unit}
              </p>
              <button
                className="btn remove"
                onClick={() =>
                  removeFromPantry({ variables: { pantryItemId: item.id } })
                }
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No items in fridge.</p>
        )}

        <h3>❄️ Freezer</h3>
        {freezerItems.length ? (
          freezerItems.map((item: any) => (
            <div key={item.id} className="pantry-item">
              <p>
                <strong>{item.item}</strong>
              </p>
              <p>
                Qty: {item.quantity} {item.unit}
              </p>
              <button
                className="btn remove"
                onClick={() =>
                  removeFromPantry({ variables: { pantryItemId: item.id } })
                }
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No items in freezer.</p>
        )}

        <h3>🗄️ Closet</h3>
        {closetItems.length ? (
          closetItems.map((item: any) => (
            <div key={item.id} className="pantry-item">
              <p>
                <strong>{item.item}</strong>
              </p>
              <p>
                Qty: {item.quantity} {item.unit}
              </p>
              <button
                className="btn remove"
                onClick={() =>
                  removeFromPantry({ variables: { pantryItemId: item.id } })
                }
              >
                Remove
              </button>
              <button
                className="btn edit"
                onClick={() => {
                  setSelectedItemName(item.item);
                  setSelectedItemId(item.id);
                  setQuantity(item.quantity);
                  setUnit(item.unit);
                  setStorageType(item.storage || "Fridge");
                }}
              >
                Edit
              </button>
            </div>
          ))
        ) : (
          <p>No items in closet.</p>
        )}
      </div>
    </div>
  );
};

export default Pantry;
