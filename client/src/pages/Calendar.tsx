import { useState } from 'react';
import '../css/Calendar.css';

const Calendar = () => {
  const [goal, setGoal] = useState('');
  const [lifestyle, setLifestyle] = useState('Moderate');

  const handleGenerateMeals = () => {
    alert("🍽 Generating meals based on calorie goal and lifestyle...");
  };

  const handleShoppingList = () => {
    alert("🛒 Opening shopping list modal...");
  };

  return (
    <div className="calendar-page">
      <div className="goals-box">
        <h3>Set Goal?</h3>
        <label>
          Desired Calorie Target:
          <input
            type="number"
            placeholder="e.g. 1800"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </label>
        <label>
          Lifestyle:
          <select value={lifestyle} onChange={(e) => setLifestyle(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Moderate">Moderate</option>
            <option value="Slug">Slug</option>
          </select>
        </label>
      </div>

      <div className="calendar-content">
        <h2>Calendar Week</h2>
        <p>
          Randomly generate breakfast, lunch, and dinner for each day from search API meeting calorie budget.
        </p>
        <div className="calendar-actions">
          <button className="btn generate-btn" onClick={handleGenerateMeals}>
            🍽 Generate Weekly Meals
          </button>
          <button className="btn shopping-btn" onClick={handleShoppingList}>
            🛒 Generate Shopping List
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
