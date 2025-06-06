import React from 'react';
import '../css/FilterModal.css';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  sortOption: string;
}

const defaultFilterValues = {
  sort: "random",
  expiringFirst: false,
  maxPrice: 100,
  maxCookTime: 180,
  dietary: [] as string[],
  cuisine: '',
  maxValue: 100,
};

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  sortOption,
}) => {
  const [filters, setFilters] = React.useState({
    ...defaultFilterValues,
    sort: sortOption || "random", // initialize with incoming prop
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'select-multiple') {
      const selected = Array.from(
        (e.target as HTMLSelectElement).selectedOptions
      ).map((opt) => opt.value);
      setFilters({ ...filters, [name]: selected });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  const handleClear = () => {
    const clearedFilters = {
      ...defaultFilterValues,
      sort: "random",
    };
    setFilters(clearedFilters);
    onApply(clearedFilters); // Apply defaults in parent (Home)
    onClose(); // Optionally close modal
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Filter & Sort Recipes</h2>

        <label>Sort By:</label>
        <select name="sort" value={filters.sort} onChange={handleChange}>
          <option value="random">Random</option>
          <option value="name">Name (A–Z)</option>
          <option value="id">ID (Ascending)</option>
        </select>

        <label>Max Cook Time: {filters.maxCookTime} minutes</label>
        <input
          type="range"
          name="maxCookTime"
          min="10"
          max="180"
          value={filters.maxCookTime}
          onChange={handleChange}
        />

        <label>Dietary Restrictions:</label>
        <select name="dietary" onChange={handleChange} multiple>
          <option value="dairy">Dairy</option>
          <option value="egg">Egg</option>
          <option value="gluten">Gluten</option>
          <option value="grain">Grain</option>
          <option value="peanut">Peanut</option>
          <option value="seafood">Seafood</option>
          <option value="sesame">Sesame</option>
          <option value="shellfish">Shellfish</option>
          <option value="soy">Soy</option>
          <option value="sulfite">Sulfite</option>
          <option value="tree-nut">Tree Nut</option>
          <option value="wheat">Wheat</option>
        </select>

        <label>Cuisine:</label>
        <select name="cuisine" onChange={handleChange} value={filters.cuisine}>
          <option value="">-- Select --</option>
          <option value="italian">Italian</option>
          <option value="mexican">Mexican</option>
          <option value="indian">Indian</option>
          <option value="chinese">Chinese</option>
          <option value="japanese">Japanese</option>
          <option value="french">French</option>
          <option value="thai">Thai</option>
          <option value="spanish">Spanish</option>
          <option value="greek">Greek</option>
          <option value="korean">Korean</option>
        </select>

        

        <label>Slider – Max Value: {filters.maxValue}</label>
        <input
          type="range"
          name="maxValue"
          min="0"
          max="100"
          value={filters.maxValue}
          onChange={handleChange}
        />

        <div className="modal-actions">
          <button onClick={() => onApply(filters)}>Apply Filters</button>
          <button onClick={handleClear}>Clear Filters</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
