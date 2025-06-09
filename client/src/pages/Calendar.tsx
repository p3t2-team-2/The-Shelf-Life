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

const Modal: React.FC<{ recipes: any, message: string; onClose: () => void }> = ({ recipes, message, onClose }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <p>{message}</p>

      <form onSubmit={() => {}}>

        <label htmlFor="recipeSearch">Search for a recipe:</label>
        <select id="recipeSearch" name="recipeSearch">
          { recipes.map((recipe: any) => (
            <option key={recipe.id} value={recipe.id}>
              {recipe.name}
            </option>
          )) }
        </select>
      </form>


      <button onClick={onClose}>OK</button>
    </div>
  </div>
);

const Calendar = () => {
  const { data, loading, refetch } = useQuery(QUERY_ME);
  const [saveMealToDate] = useMutation(SAVE_MEAL_TO_DATE);
  const [removeMealFromDate] = useMutation(REMOVE_MEAL_FROM_DATE);
  const [generateMeals] = useMutation(GENERATE_MEALS);
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalMessage, setModalMessage] = useState<string | null>("testing modal message");
  // we are adding a STATE for the modal. True | False
  const [showModal, setShowModal] = useState(false);

  const profile = data?.me || {};
  const calendarMeals =
    typeof profile.calendarMeals === "string"
      ? JSON.parse(profile.calendarMeals)
      : profile.calendarMeals || {};

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const baseSunday = new Date(today);
  baseSunday.setDate(baseSunday.getDate() - baseSunday.getDay()); // Sunday of current week
  baseSunday.setDate(baseSunday.getDate() + weekOffset * 7);
  const startOfWeek = baseSunday;

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const handleAddMeal = async (dateStr: string) => {
    // Update Modal STATE - TRUE - IS SHOWING
    setShowModal(true);

    const meal = prompt(`Add a meal for ${dateStr}`);
    if (meal) {
      try {
        await saveMealToDate({
          variables: { date: dateStr, meal },
          refetchQueries: [{ query: QUERY_ME }],
        });
      } catch (err) {
        console.error("Error saving meal:", err);
        setModalMessage("❌ Could not save meal.");
      }
    }
  };

  const openModal = () => {
    // Update Modal STATE - TRUE - IS SHOWING
    setShowModal(true);

  }

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

  if(showModal) { 
    return (
      <Modal
        recipes={data.me.recipes}
        message={modalMessage || "Select a recipe to add to your meal plan."}
        onClose={() => {
          setShowModal(false);
          setModalMessage(null);
        }}
      />
    );
  }

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

             { <button className="btn small-btn" onClick={() => /* handleAddMeal(dateStr) */ openModal()}>
                ➕ Add Meal
              </button>
             }

            </div>
          );
        })}
      </div>

      { /*modalMessage showModal && <Modal recipes={data.me.recipes} message={modalMessage} onClose={() => setModalMessage(null)} /> */}

     
    </div>
  );
};

export default Calendar;