import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Link } from "react-router-dom";
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
  mutation RemoveMealFromDate($date: String!, $index: Int!, $category: String!) {
    removeMealFromDate(date: $date, index: $index, category: $category) {
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

const ADD_TO_DATE = gql`
  mutation Mutation($date: String!, $addMealToDateId: Int!, $category: String!) {
    addMealToDate(date: $date, id: $addMealToDateId, category: $category) {
      calendarMeals
    }
  }
`;

const Modal: React.FC<{
  recipes: any;
  message: string;
  onClose: () => void;
  onSubmit: () => void;
  selectedRecipeId: number | null;
  setSelectedRecipeId: (id: number) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}> = ({
  recipes,
  message,
  onClose,
  onSubmit,
  selectedRecipeId,
  setSelectedRecipeId,
  selectedCategory,
  setSelectedCategory,
}) => (
  <div className="modal-backdrop">
    <div className="modal">
      <p>{message}</p>

      <label htmlFor="recipeSearch">Select a recipe:</label>
      <select
        id="recipeSearch"
        value={selectedRecipeId ?? ""}
        onChange={(e) => setSelectedRecipeId(Number(e.target.value))}
      >
        <option value="" disabled>Select a recipe</option>
        {recipes.map((recipe: any) => (
          <option key={recipe.id} value={recipe.id}>
            {recipe.name}
          </option>
        ))}
      </select>

      <label htmlFor="mealCategory">Category:</label>
      <select
        id="mealCategory"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="breakfast">Breakfast</option>
        <option value="lunch">Lunch</option>
        <option value="dinner">Dinner</option>
      </select>

      <div className="button-group" style={{ marginTop: "1rem" }}>
        <button className="btn modal" onClick={onSubmit}>Add Meal</button>
        <button className="btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

const Calendar = () => {
  const { data, loading, refetch } = useQuery(QUERY_ME);
  const [saveMealToDate] = useMutation(SAVE_MEAL_TO_DATE);
  const [removeMealFromDate] = useMutation(REMOVE_MEAL_FROM_DATE);
  const [generateMeals] = useMutation(GENERATE_MEALS);
  const [addToDate] = useMutation(ADD_TO_DATE, {
    refetchQueries: [{ query: QUERY_ME }],
  });

  const [weekOffset, setWeekOffset] = useState(0);
  const [modalMessage, setModalMessage] = useState<string | null>("Select a recipe to add to your meal plan.");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("breakfast");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const profile = data?.me || {};
  const calendarMeals = typeof profile.calendarMeals === "string"
    ? JSON.parse(profile.calendarMeals)
    : profile.calendarMeals || {};

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const baseSunday = new Date(today);
  baseSunday.setDate(baseSunday.getDate() - baseSunday.getDay());
  baseSunday.setDate(baseSunday.getDate() + weekOffset * 7);
  const startOfWeek = baseSunday;

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const handleAddMeal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const onSubmitMeal = async () => {
    if (!selectedDate || selectedRecipeId === null || !selectedCategory) return;

    try {
      await addToDate({
        variables: {
          date: selectedDate,
          addMealToDateId: selectedRecipeId,
          category: selectedCategory,
        },
      });
      setShowModal(false);
      setSelectedDate(null);
      setModalMessage("✅ Meal added successfully!");
      await refetch();
    } catch (err) {
      console.error("❌ Error saving meal:", err);
      setModalMessage("❌ Could not save meal.");
    }
  };

  const handleDeleteMeal = async (dateStr: string, index: number, category: string) => {
    try {
      await removeMealFromDate({
        variables: { date: dateStr, index, category },
      });
      await refetch();
    } catch (err) {
      console.error("❌ Error removing meal:", err);
      setModalMessage("❌ Could not delete meal.");
    }
  };

  const handleGenerateMeals = async () => {
    try {
      const weekStart = weekDates[1];
      await generateMeals({
        variables: {
          year: weekStart.getFullYear(),
          month: weekStart.getMonth() + 1,
          weekStart: weekStart.getDate(),
        },
      });
      await refetch();
      setModalMessage("✅ Weekly meals generated!");
    } catch (error) {
      console.error("❌ Error generating meals:", error);
      setModalMessage("❌ Failed to generate meals.");
    }
  };

  const handlePrevWeek = () => setWeekOffset(weekOffset - 1);
  const handleNextWeek = () => setWeekOffset(weekOffset + 1);

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div className="calendar-page">
      <h1>Weekly Meal Planner</h1>

      <div className="calendar-controls">
        <button className="btn generate-btn" onClick={handleGenerateMeals}>
          🍽 Generate Weekly Meals
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

          const breakfast = calendarMeals?.breakfast?.[dateStr] || [];
          const lunch = calendarMeals?.lunch?.[dateStr] || [];
          const dinner = calendarMeals?.dinner?.[dateStr] || [];

          return (
            <div className={`calendar-day ${isToday ? "today" : ""}`} key={index}>
              <h4>
                {date.toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </h4>

              {[{ label: "Breakfast", list: breakfast },
                { label: "Lunch", list: lunch },
                { label: "Dinner", list: dinner },
              ].map(({ label, list }) => (
                <div key={label}>
                  <h5 className="meal-category">{label}</h5>
                  {list.length ? (
                    <ul>
                      {list.map((meal: any, i: number) => {
                        const display = typeof meal === "object"
                          ? meal.title || "Untitled Meal"
                          : meal;

                        const link = typeof meal === "object" && meal.id
                          ? `/recipes/${meal.id}`
                          : "#";

                        return (
                          <li key={i}>
                            {link !== "#" ? (
                              <Link to={link} className="recipe-link">
                                🍴 {display}
                              </Link>
                            ) : (
                              <>🍴 {display}</>
                            )}
                            <button
                              className="delete-btn"
                              onClick={() => handleDeleteMeal(dateStr, i, label.toLowerCase())}
                            >
                              ✖
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="no-meals">No {label.toLowerCase()} yet</p>
                  )}
                </div>
              ))}

              <button className="btn small-btn" onClick={() => handleAddMeal(dateStr)}>
                ➕ Add Meal
              </button>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal
          recipes={data.me.recipes}
          message={modalMessage || ""}
          onClose={() => setShowModal(false)}
          onSubmit={onSubmitMeal}
          selectedRecipeId={selectedRecipeId}
          setSelectedRecipeId={setSelectedRecipeId}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )}
    </div>
  );
};

export default Calendar;