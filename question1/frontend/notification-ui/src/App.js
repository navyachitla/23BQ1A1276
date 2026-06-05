import { useEffect, useState } from "react";

function App() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("http://4.224.186.213/evaluation-service/notifications")
      .then(res => res.json())
      .then(data => setNotifications(data.notifications));
  }, []);

  const getPriority = (type) => {
    if (type === "Placement") return 3;
    if (type === "Result") return 2;
    return 1;
  };

  const sorted = [...notifications].sort(
    (a, b) => getPriority(b.Type) - getPriority(a.Type)
  );

  const filtered =
    filter === "All"
      ? sorted
      : sorted.filter(n => n.Type === filter);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Notification Dashboard</h1>

      {/* Filter Buttons */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setFilter("All")}>All</button>
        <button onClick={() => setFilter("Placement")}>Placement</button>
        <button onClick={() => setFilter("Result")}>Result</button>
        <button onClick={() => setFilter("Event")}>Event</button>
      </div>

      {/* Notifications List */}
      {filtered.map((n) => (
        <div
          key={n.ID}
          style={{
            border: "1px solid black",
            margin: "10px",
            padding: "10px",
            borderRadius: "5px"
          }}
        >
          <h3>{n.Type}</h3>
          <p>{n.Message}</p>
          <small>{n.Timestamp}</small>
        </div>
      ))}
    </div>
  );
}

export default App;