
import React, { useEffect, useState } from "react";
import "./App.css";

const defaultHabits = [
  { id: 1, name: "Wake up on time", emoji: "⏰" },
  { id: 2, name: "DSA practice", emoji: "🧠" },
  { id: 3, name: "Exercise / Gym", emoji: "💪" },
  { id: 4, name: "Node.js practice", emoji: "🟢" },
  { id: 5, name: "Aptitude practice", emoji: "📊" },
  { id: 6, name: "React.js practice", emoji: "⚛️" },
  { id: 7, name: "Project work", emoji: "💻" },
  { id: 8, name: "English practice", emoji: "🗣️" },
  { id: 9, name: "Django", emoji: "🐍" },
  { id: 10, name: "Plan tomorrow", emoji: "📝" },
  { id: 11, name: "Avoid social media", emoji: "📵" },
];

const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [habits, setHabits] = useState(() =>
    readStorage("habitflow-habits", defaultHabits)
  );

  const [activity, setActivity] = useState(() =>
    readStorage("habitflow-activity", {})
  );

  const [selectedDate, setSelectedDate] = useState(
    getDateKey(new Date())
  );

  const [month, setMonth] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const [newHabit, setNewHabit] = useState("");
  const [newEmoji, setNewEmoji] = useState("✨");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("habitflow-habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("habitflow-activity", JSON.stringify(activity));
  }, [activity]);

  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1
  ).getDay();

  const monthName = month.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const getCompletedCount = (dateKey) => {
    const completed = activity[dateKey] || [];
    return habits.filter((habit) =>
      completed.includes(habit.id)
    ).length;
  };

  const selectedCompleted = getCompletedCount(selectedDate);

  const dailyProgress = habits.length
    ? Math.round((selectedCompleted / habits.length) * 100)
    : 0;

  let monthCompleted = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const key = getDateKey(
      new Date(month.getFullYear(), month.getMonth(), day)
    );
    monthCompleted += getCompletedCount(key);
  }

  const monthlyProgress =
    habits.length && daysInMonth
      ? Math.round(
          (monthCompleted / (habits.length * daysInMonth)) * 100
        )
      : 0;

  const toggleHabit = (habitId) => {
    setActivity((previous) => {
      const completed = previous[selectedDate] || [];

      const updated = completed.includes(habitId)
        ? completed.filter((id) => id !== habitId)
        : [...completed, habitId];

      return {
        ...previous,
        [selectedDate]: updated,
      };
    });
  };

  const addHabit = (event) => {
    event.preventDefault();

    if (!newHabit.trim()) return;

    const habit = {
      id: Date.now(),
      name: newHabit.trim(),
      emoji: newEmoji || "✨",
    };

    setHabits((previous) => [...previous, habit]);
    setNewHabit("");
    setNewEmoji("✨");
    setShowForm(false);
  };

  const deleteHabit = (habitId) => {
    if (!window.confirm("Delete this habit and its saved history?")) {
      return;
    }

    setHabits((previous) =>
      previous.filter((habit) => habit.id !== habitId)
    );

    setActivity((previous) => {
      const updated = {};

      Object.entries(previous).forEach(([date, ids]) => {
        updated[date] = ids.filter((id) => id !== habitId);
      });

      return updated;
    });
  };

  const changeMonth = (amount) => {
    setMonth(
      new Date(
        month.getFullYear(),
        month.getMonth() + amount,
        1
      )
    );
  };

  const days = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );

  const topHabits = habits
    .map((habit) => {
      let count = 0;

      days.forEach((day) => {
        const key = getDateKey(
          new Date(month.getFullYear(), month.getMonth(), day)
        );

        if ((activity[key] || []).includes(habit.id)) {
          count++;
        }
      });

      return { ...habit, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          habit<span className="brand-accent">flow</span>
        </div>

        <p className="nav-heading">WORKSPACE</p>

        <button className="nav-item active">▦ <span>Overview</span></button>

        <button
          className="nav-item"
          onClick={() =>
            document.getElementById("calendar")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          ▦ <span>Habit calendar</span>
        </button>

        <button
          className="nav-item"
          onClick={() =>
            document.getElementById("insights")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          ↗ <span>Insights</span>
        </button>

        <div className="sidebar-bottom">
          <div className="motivation">
            <span>🔥</span>
            <div>
              <strong>Keep going!</strong>
              <p>Consistency beats intensity.</p>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">H</div>
            <div>
              <strong>My Dashboard</strong>
              <p>Personal workspace</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR DAILY COMPANION</p>
            <h1>Build better habits<span>.</span></h1>
          </div>

          <button
            className="today-button"
            onClick={() => {
              const now = new Date();
              setSelectedDate(getDateKey(now));
              setMonth(
                new Date(now.getFullYear(), now.getMonth(), 1)
              );
            }}
          >
            📅 Today
          </button>
        </header>

        <section className="welcome">
          <div>
            <p className="muted">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </p>

            <h2>
              Make today count <span className="sparkle">✦</span>
            </h2>

            <p className="muted">
              Small steps every day lead to big results.
            </p>
          </div>

          <div className="welcome-icon">🎯</div>
        </section>

        <section className="stats-grid">
          <StatCard
            label="TODAY'S PROGRESS"
            value={`${dailyProgress}%`}
            detail={`${selectedCompleted} of ${habits.length} habits completed`}
            percent={dailyProgress}
            color="purple"
            icon="⚡"
          />

          <StatCard
            label="MONTHLY COMPLETIONS"
            value={monthCompleted}
            detail={`${monthlyProgress}% monthly completion`}
            percent={monthlyProgress}
            color="green"
            icon="✓"
          />

          <StatCard
            label="ACTIVE HABITS"
            value={habits.length}
            detail="Your daily commitments"
            percent={habits.length ? 100 : 0}
            color="orange"
            icon="✦"
          />
        </section>

        <section className="content-grid">
          <div className="panel" id="calendar">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">YOUR ROUTINE</p>
                <h3>Habit calendar</h3>
              </div>

              <div className="month-switch">
                <button onClick={() => changeMonth(-1)}>‹</button>
                <strong>{monthName}</strong>
                <button onClick={() => changeMonth(1)}>›</button>
              </div>
            </div>

            <div className="calendar-grid">
              {["S", "M", "T", "W", "T", "F", "S"].map(
                (day, index) => (
                  <div className="weekday" key={`${day}-${index}`}>
                    {day}
                  </div>
                )
              )}

              {Array.from({ length: firstDay }, (_, index) => (
                <div className="empty-day" key={`empty-${index}`} />
              ))}

              {days.map((day) => {
                const key = getDateKey(
                  new Date(month.getFullYear(), month.getMonth(), day)
                );

                const completed = getCompletedCount(key);

                let status = "";

                if (habits.length && completed === habits.length) {
                  status = "all-done";
                } else if (completed > 0) {
                  status = "some-done";
                }

                return (
                  <button
                    key={day}
                    className={`calendar-day ${
                      selectedDate === key ? "selected" : ""
                    } ${
                      key === getDateKey(new Date()) ? "today" : ""
                    }`}
                    onClick={() => setSelectedDate(key)}
                    title={`${completed}/${habits.length} habits completed`}
                  >
                    <span>{day}</span>
                    <i className={status} />
                  </button>
                );
              })}
            </div>

            <div className="legend">
              <span><i className="legend-green" /> All done</span>
              <span><i className="legend-purple" /> In progress</span>
              <span><i className="legend-grey" /> Not started</span>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">DAILY CHECKLIST</p>
                <h3>
                  {selectedDate === getDateKey(new Date())
                    ? "Today's habits"
                    : new Date(selectedDate + "T12:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                </h3>
              </div>

              <span className="count-badge">
                {selectedCompleted}/{habits.length}
              </span>
            </div>

            <div className="daily-summary">
              <div>
                <span>Daily completion</span>
                <strong>{dailyProgress}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className="progress-fill purple"
                  style={{ width: `${dailyProgress}%` }}
                />
              </div>
            </div>

            <div className="habit-list">
              {habits.map((habit) => {
                const completed = (
                  activity[selectedDate] || []
                ).includes(habit.id);

                return (
                  <div
                    className={`habit-row ${completed ? "completed" : ""}`}
                    key={habit.id}
                  >
                    <button
                      className={`checkbox ${completed ? "checked" : ""}`}
                      onClick={() => toggleHabit(habit.id)}
                      aria-label={`Toggle ${habit.name}`}
                    >
                      {completed ? "✓" : ""}
                    </button>

                    <span className="habit-emoji">{habit.emoji}</span>
                    <span className="habit-name">{habit.name}</span>

                    <button
                      className="delete-button"
                      onClick={() => deleteHabit(habit.id)}
                      title="Delete habit"
                      aria-label={`Delete ${habit.name}`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {showForm ? (
              <form className="add-form" onSubmit={addHabit}>
                <input
                  className="emoji-input"
                  value={newEmoji}
                  onChange={(event) => setNewEmoji(event.target.value)}
                  aria-label="Habit emoji"
                  maxLength={4}
                />

                <input
                  value={newHabit}
                  onChange={(event) => setNewHabit(event.target.value)}
                  placeholder="Enter a new habit"
                  required
                  maxLength={80}
                  autoFocus
                />

                <button className="save-button" type="submit">Add</button>

                <button
                  className="cancel-button"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </form>
            ) : (
              <button
                className="add-button"
                onClick={() => setShowForm(true)}
              >
                ＋ Add a new habit
              </button>
            )}
          </div>
        </section>

        <section className="content-grid insights-grid" id="insights">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">CONSISTENCY OVER TIME</p>
                <h3>Daily progress</h3>
              </div>

              <span className="chart-label"><i /> Completion %</span>
            </div>

            <div className="chart">
              <div className="chart-y-axis">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              <div className="chart-content">
                <div className="chart-grid-lines">
                  {[0, 1, 2, 3, 4].map((line) => (
                    <div key={line} />
                  ))}
                </div>

                <div className="bars">
                  {days.map((day) => {
                    const key = getDateKey(
                      new Date(month.getFullYear(), month.getMonth(), day)
                    );

                    const percent = habits.length
                      ? Math.round(
                          (getCompletedCount(key) / habits.length) * 100
                        )
                      : 0;

                    return (
                      <div className="bar-column" key={day}>
                        <div
                          className="bar"
                          style={{ height: `${percent}%` }}
                          title={`Day ${day}: ${percent}%`}
                        />
                        <span>{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          
        </section>

        <footer className="footer">
          <span>HabitFlow ✦ Your progress, your pace.</span>
          <span>Saved in this browser</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ label, value, detail, percent, color, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-heading">
        {label}
        <span className={`stat-icon ${color}`}>{icon}</span>
      </div>

      <h2>{value}</h2>
      <p>{detail}</p>

      <div className="progress-track">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}