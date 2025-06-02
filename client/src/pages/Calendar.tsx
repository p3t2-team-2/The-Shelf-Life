import { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { QUERY_ME } from '../utils/queries';
import '../css/Calendar.css';

const SAVE_MEAL_TO_DATE = gql`
  mutation SaveMealToDate($date: String!, $meal: String!) {
    saveMealToDate(date: $date, meal: $meal) {
      _id
      calendarMeals
    }
  }
`;

const Calendar = () => {
  const { data, loading } = useQuery(QUERY_ME);
  const [saveMealToDate] = useMutation(SAVE_MEAL_TO_DATE);
  const profile = data?.me || {};

  const [goal, setGoal] = useState('');
  const [lifestyle, setLifestyle] = useState('Moderate');
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const meals: { [date: string]: string[] } = profile.calendarMeals || {};

  const handleAddMeal = async (dateStr: string) => {
    const meal = prompt(`Add a meal for ${dateStr}`);
    if (meal) {
      try {
        await saveMealToDate({
          variables: { date: dateStr, meal },
          refetchQueries: [{ query: QUERY_ME }],
        });
      } catch (err) {
        console.error('Error saving meal:', err);
      }
    }
  };

  const handleDeleteMeal = (dateStr: string, index: number) => {
    alert('Remove meal functionality not implemented yet.');
  };

  const handleGenerateMeals = () => {
    alert('🍽 Generate meals logic coming soon...');
  };

  const handleShoppingList = () => {
    alert('🛒 Shopping list logic coming soon...');
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const calendarDays = [
    ...Array(firstDayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const formattedMonth = currentDate.toLocaleString('default', { month: 'long' });

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div className="calendar-page">
      <div className="goals-box">
        <h3>Set Goal</h3>
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

      <div className="calendar-controls">
        <button className="btn generate-btn" onClick={handleGenerateMeals}>
          🍽 Generate Monthly Meals
        </button>
        <button className="btn shopping-btn" onClick={handleShoppingList}>
          🛒 Generate Shopping List
        </button>
      </div>

      <div className="calendar-header">
        <button className="btn small-btn" onClick={handlePrevMonth}>← Prev</button>
        <h2>{formattedMonth} {year}</h2>
        <button className="btn small-btn" onClick={handleNextMonth}>Next →</button>
      </div>

      <div className="calendar-grid month-view">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="calendar-day header">
            <strong>{d}</strong>
          </div>
        ))}

        {calendarDays.map((day, index) => {
          const dateStr = day
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : '';
          const isToday = dateStr === todayStr;

          return (
            <div className={`calendar-day ${isToday ? 'today' : ''}`} key={index}>
              {day && (
                <>
                  <h4>{day}</h4>
                  <ul>
                    {(meals[dateStr] || []).map((meal, i) => (
                      <li key={i}>
                        🍴 {meal}
                        <button className="delete-btn" onClick={() => handleDeleteMeal(dateStr, i)}>
                          ✖
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button className="btn small-btn" onClick={() => handleAddMeal(dateStr)}>
                    ➕ Add Meal
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;