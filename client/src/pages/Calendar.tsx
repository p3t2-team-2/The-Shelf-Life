import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import "../css/Calendar.css";

const SAVE_MEAL_TO_DATE = gql`
  mutation SaveMealToDate($date: String!, $meal: String!) {
    saveMealToDate(date: $date, meal: $meal) {
      _id
      calendarMeals
    }
  }
`;

const REMOVE_MEAL_FROM_DATE = gql`
  mutation RemoveMealFromDate($date: String!, $index: Int!) {
    removeMealFromDate(date: $date, index: $index) {
      _id
      calendarMeals
    }
  }
`;

const GENERATE_MEALS = gql`
  mutation GenerateMeals($year: Int!, $month: Int!, $weekStart: Int!) {
    generateMeals(year: $year, month: $month, weekStart: $weekStart) {
      calendarMeals
    }
  }
`;

const Calendar = () => {
  const { data, loading, refetch } = useQuery(QUERY_ME);
  const [saveMealToDate] = useMutation(SAVE_MEAL_TO_DATE);
  const [removeMealFromDate] = useMutation(REMOVE_MEAL_FROM_DATE);
  const [generateMeals] = useMutation(GENERATE_MEALS);

  const profile = data?.me || {};
  let meals: { [date: string]: string[] } = {};
  try {
    meals = typeof profile.calendarMeals === "string"
      ? JSON.parse(profile.calendarMeals)
      : profile.calendarMeals || {};
  } catch (err) {
    console.error("❌ Error parsing calendarMeals:", err);
  }

  const [goal, setGoal] = useState("");
  const [lifestyle, setLifestyle] = useState("Moderate");
  const [weekOffset, setWeekOffset] = useState(0);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const handleAddMeal = async (dateStr: string) => {
    const meal = prompt(`Add a meal for ${dateStr}`);
    if (meal) {
      try {
        await saveMealToDate({
          variables: { date: dateStr, meal },
          refetchQueries: [{ query: QUERY_ME }],
        });
      } catch (err) {
        console.error("Error saving meal:", err);
      }
    }
  };

  const handleDeleteMeal = async (dateStr: string, index: number) => {
    try {
      await removeMealFromDate({
        variables: { date: dateStr, index },
      });
      await refetch();
    } catch (err) {
      console.error("Error removing meal:", err);
    }
  };

  const handleGenerateMeals = async () => {
    try {
      const weekStart = weekDates[0];
      await generateMeals({
        variables: {
          year: weekStart.getFullYear(),
          month: weekStart.getMonth() + 1,
          weekStart: weekStart.getDate(),
        },
      });
      await refetch();
      alert("✅ Weekly meals generated!");
    } catch (error) {
      console.error("❌ Error generating meals:", error);
      alert("❌ Failed to generate meals.");
    }
  };

  const handleShoppingList = () => {
    alert("🛒 Shopping list logic coming soon...");
  };

  const handlePrevWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  const handleNextWeek = () => {
    setWeekOffset(weekOffset + 1);
  };

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
          <select
            value={lifestyle}
            onChange={(e) => setLifestyle(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Moderate">Moderate</option>
            <option value="Slug">Slug</option>
          </select>
        </label>
      </div>

      <div className="calendar-controls">
        <button className="btn generate-btn" onClick={handleGenerateMeals}>
          🍽 Generate Weekly Meals
        </button>
        <button className="btn shopping-btn" onClick={handleShoppingList}>
          🛒 Generate Shopping List
        </button>
      </div>

      <div className="calendar-header">
        <button className="btn small-btn" onClick={handlePrevWeek}>← Prev</button>
        <h2>
          Week of{" "}
          {startOfWeek.toLocaleDateString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h2>
        <button className="btn small-btn" onClick={handleNextWeek}>Next →</button>
      </div>

      <div className="calendar-grid week-view">
        {weekDates.map((date, index) => {
          const dateStr = date.toISOString().split("T")[0];
          const isToday = dateStr === todayStr;

          return (
            <div className={`calendar-day ${isToday ? "today" : ""}`} key={index}>
              <h4>
                {date.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h4>

              {meals[dateStr]?.length ? (
                <ul>
                  {meals[dateStr].map((meal, i) => (
                    <li key={i}>
                      🍴 {meal}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteMeal(dateStr, i)}
                      >
                        ✖
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-meals">No meals yet</p>
              )}

              <button className="btn small-btn" onClick={() => handleAddMeal(dateStr)}>
                ➕ Add Meal
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;