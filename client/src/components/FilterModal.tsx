import React from 'react';
import '../css/FilterModal.css';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  sortOption: string;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  sortOption,
}) => {
  const [filters, setFilters] = React.useState({
    sort: sortOption,
    expiringFirst: false,
    maxPrice: 20,
    maxCookTime: 60,
    dietary: [] as string[],
    mealType: '',
    cuisine: '',
    appliance: '',
    maxValue: 100,
  });

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.checked });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return !isOpen ? null : (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Filter & Sort Recipes</h2>

        <label>Sort By:</label>
        <select name="sort" value={filters.sort} onChange={handleChange}>
          <option value="random">Random</option>
          <option value="name">Name (A–Z)</option>
          <option value="id">ID (Ascending)</option>
        </select>

        <label>
  Max Cook Time: {filters.maxCookTime} minutes
</label>
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

        <label>Meal Type:</label>
        <select name="mealType" onChange={handleChange}>
          <option value="">-- Select --</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
            <option value="dessert">Dessert</option>
        </select>

        <label>Cuisine:</label>
        <select name="cuisine" onChange={handleChange}>
          <option value="">-- Select --</option>
          <option value="italian">Italian</option>
          <option value="mexican">Mexican</option>
          <option value="indian">Indian</option>
            <option value="chinese">Chinese</option>
            <option value="japanese">Japanese</option>
            <option value="american">American</option>
            <option value="french">French</option>
            <option value="thai">Thai</option>
            <option value="spanish">Spanish</option>
            <option value="greek">Greek</option>
            <option value="korean">Korean</option>
            <option value="mediterranean">Mediterranean</option>
        </select>

        <label>Appliance:</label>
        <select name="appliance" onChange={handleChange}>
          <option value="">-- Select --</option>
          <option value="oven">Oven</option>
          <option value="microwave">Microwave</option>
          <option value="airfryer">Air Fryer</option>
        </select>

        <label>Slider – Max Value: {filters.maxValue}</label>
        <input type="range" name="maxValue" min="0" max="100" value={filters.maxValue} onChange={handleChange} />

        <div className="modal-actions">
          <button onClick={() => onApply(filters)}>Apply Filters</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;