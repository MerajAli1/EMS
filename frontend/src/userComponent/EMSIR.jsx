import { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Header from "../userComponent/Navbar";
import { Link } from "react-router-dom";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function EMSIR() {
  // State for all rooms data
  const [rooms, setRooms] = useState([]);
  const [user, setUser] = useState(null); // State to hold the user from localStorage

  // Helper functions to generate random numbers
  const getRandom = (min, max) =>
    parseFloat((Math.random() * (max - min) + min).toFixed(2));
  const getRandomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  useEffect(() => {
    // 1. Get user data from localStorage
    const storedUser = localStorage.getItem("user"); // Use "User" as the key
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User data from localStorage:", parsedUser);

        // 2. Access the 'Room' array and prepare it for display
        if (parsedUser.Room && Array.isArray(parsedUser.Room)) {
          // Map the room data to fit your display structure (without live values yet)
          const formattedRooms = parsedUser.Room.map((room) => ({
            id: room._id, // Use _id as a unique key for React
            name: room.roomName,
            status: room.automation ? "Automated" : "Manual Control", // Example status based on automation
            lastSeen: "Today 12:00 PM", // Placeholder
            isConnected: true, // Assuming true for display, adjust as needed
            // Live values will be added in the next effect
          }));
          setRooms(formattedRooms);
        } else {
          console.warn(
            "No 'Room' array found in user data or it's not an array."
          );
          setRooms([]); // Set rooms to empty if no valid 'Room' data
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUser(null);
        setRooms([]);
      }
    } else {
      console.log("No 'User' data found in localStorage.");
      setUser(null);
      setRooms([]);
      // Optionally, redirect to login or show a message that user is not logged in.
    }
  }, []); // Empty dependency array means this effect runs once on mount

  // Real-time update of current, voltage, power for each room
  useEffect(() => {
    if (rooms.length === 0) return;
    const updateLiveMetrics = () => {
      setRooms((prevRooms) =>
        prevRooms.map((room) => ({
          ...room,
          current: getRandom(0.5, 1.0),
          voltage: getRandomInt(210, 240),
          power: getRandomInt(100, 250),
        }))
      );
    };
    updateLiveMetrics(); // Initial update
    const interval = setInterval(updateLiveMetrics, 5000);
    return () => clearInterval(interval);
  }, [rooms.length]); // Only re-run the effect if rooms.length changes

  // Chart data (you might want to make this dynamic based on actual room power)
  const chartData = {
    labels: rooms.map((room) => room.name), // Use actual room names
    datasets: [
      {
        data:
          rooms.length > 0
            ? rooms.map((room, index) => {
                // Assign dummy percentages for the chart for now
                // In a real app, this would be based on actual power consumption
                const percentages = [50, 30, 19, 20, 15]; // Example percentages
                return percentages[index % percentages.length] || 0;
              })
            : [100], // Default to 100% if no rooms
        backgroundColor: [
          "#007bff",
          "#28a745",
          "#ffc107",
          "#dc3545",
          "#17a2b8",
        ], // More colors for more rooms
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%", // Makes it a donut chart
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            family: "Inter, sans-serif",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed !== null) {
              label += context.parsed + "%";
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <>
      <Header />

      <div style={{ backgroundColor: "#f5f5f5" }}>
        <div
          className="container"
          style={{
            fontFamily: "Inter, sans-serif",
            minHeight: "100vh",
            paddingBottom: "20px",
          }}
        >
          {/* User Info */}
          <div
            className="d-flex justify-content-between align-items-center mb-4 text-muted"
            style={{ fontSize: "0.9rem" }}
          >
            <span>
              {new Date().toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </span>
            <span>Logged in as: {user ? user.Username : "Not logged in"}</span>{" "}
            {/* Display Username */}
          </div>

          {/* Room Monitoring Section - Dynamically rendered */}
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div
                className="card shadow-sm mb-4"
                style={{ borderRadius: "15px" }}
                key={room.id} // Use the room's unique ID as the key
              >
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5
                      className="card-title fw-bold"
                      style={{ color: "#343a40" }}
                    >
                      {room.name}
                    </h5>
                    <span
                      className={`${
                        room.isConnected ? "text-success" : "text-danger"
                      } fw-bold d-flex align-items-center`}
                    >
                      <i
                        className="fas fa-circle me-2"
                        style={{ fontSize: "0.7rem" }}
                      ></i>{" "}
                      {room.status}
                    </span>
                  </div>
                  {/* You might want to show lastSeen only if not connected or if it's relevant */}
                  <div
                    className="text-muted mb-3"
                    style={{ fontSize: "0.85rem", textAlign: "right" }}
                  >
                    Last seen {room.lastSeen}
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <div
                        className="card h-100 p-3 text-center"
                        style={{ borderRadius: "10px" }}
                      >
                        <p
                          className="mb-1 text-muted"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Current
                        </p>
                        <h3 className="fw-bold" style={{ color: "#343a40" }}>
                          {room.current}
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div
                        className="card h-100 p-3 text-center"
                        style={{ borderRadius: "10px" }}
                      >
                        <p
                          className="mb-1 text-muted"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Voltage
                        </p>
                        <h3 className="fw-bold" style={{ color: "#343a40" }}>
                          {room.voltage}
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div
                        className="card h-100 p-3 text-center"
                        style={{ borderRadius: "10px" }}
                      >
                        <p
                          className="mb-1 text-muted"
                          style={{ fontSize: "0.85rem" }}
                        >
                          Power
                        </p>
                        <h3 className="fw-bold" style={{ color: "#007bff" }}>
                          {room.power}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end">
                    <Link
                      to={{
                        pathname: "/emsuserforemsir",
                      }}
                      state={{ roomName: room.name }}
                      className="btn btn-primary"
                      style={{ borderRadius: "8px", padding: "8px 20px" }}
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-info text-center" role="alert">
              Loading room data or no rooms available.
            </div>
          )}

          <div className="container-fluid px-4">
            {/* Room Energy Usage Section */}
            <div
              className="card shadow-sm mb-4"
              style={{ borderRadius: "15px" }}
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5
                    className="card-title fw-bold"
                    style={{ color: "#343a40" }}
                  >
                    Room Energy Usage
                  </h5>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      style={{ borderRadius: "8px" }}
                    >
                      Energy
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      style={{ borderRadius: "8px" }}
                    >
                      Cost
                    </button>
                  </div>
                </div>
                <p
                  className="card-subtitle mb-3 text-muted"
                  style={{ fontSize: "0.9rem" }}
                >
                  Energy consumption by room
                </p>

                <div className="row align-items-center">
                  <div className="col-md-6 d-flex justify-content-center">
                    <div
                      style={{
                        position: "relative",
                        width: "250px",
                        height: "250px",
                      }}
                    >
                      <Doughnut data={chartData} options={chartOptions} />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          textAlign: "center",
                          fontSize: "1.2rem",
                          fontWeight: "bold",
                          color: "#343a40",
                        }}
                      >
                        {/* You can add a central text here if needed, like total usage */}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex flex-column justify-content-center h-100">
                      {rooms.map((room, index) => (
                        <div
                          className="d-flex align-items-center mb-2"
                          key={`chart-legend-${room.id}`}
                        >
                          <span
                            className="me-2"
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              backgroundColor:
                                chartData.datasets[0].backgroundColor[
                                  index %
                                    chartData.datasets[0].backgroundColor.length
                                ],
                            }}
                          ></span>
                          <span
                            className="fw-bold"
                            style={{ color: "#343a40" }}
                          >
                            {room.name}{" "}
                            <span className="text-muted fw-normal">
                              {chartData.datasets[0].data[index]} %
                            </span>
                          </span>
                        </div>
                      ))}
                      {rooms.length === 0 && (
                        <p className="text-muted">
                          No rooms to display in chart.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis Section */}
            <div
              className="card shadow-sm mb-4"
              style={{ borderRadius: "15px" }}
            >
              <div className="card-body p-4">
                <h5
                  className="card-title fw-bold mb-3"
                  style={{ color: "#343a40" }}
                >
                  Detailed Analysis
                </h5>
                <ul
                  className="nav nav-tabs mb-3"
                  style={{ borderBottom: "none" }}
                >
                  <li className="nav-item">
                    <a
                      className="nav-link active"
                      aria-current="page"
                      href="#"
                      style={{
                        border: "none",
                        borderBottom: "2px solid #007bff",
                        color: "#007bff",
                        fontWeight: "bold",
                      }}
                    >
                      Consumption
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#"
                      style={{ border: "none", color: "#6c757d" }}
                    >
                      Costs
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className="nav-link"
                      href="#"
                      style={{ border: "none", color: "#6c757d" }}
                    >
                      Insights
                    </a>
                  </li>
                </ul>

                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div
                      className="card h-100 p-3"
                      style={{
                        borderRadius: "10px",
                      }}
                    >
                      <p
                        className="mb-1 text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Daily Average
                      </p>
                      <h4 className="fw-bold" style={{ color: "#343a40" }}>
                        3.2 kWh
                      </h4>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div
                      className="card h-100 p-3"
                      style={{
                        borderRadius: "10px",
                      }}
                    >
                      <p
                        className="mb-1 text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Peak Usage
                      </p>
                      <h4 className="fw-bold" style={{ color: "#343a40" }}>
                        735 W
                      </h4>
                      <p
                        className="mb-0 text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Today at 7:30 PM
                      </p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div
                      className="card h-100 p-3"
                      style={{
                        borderRadius: "10px",
                      }}
                    >
                      <p
                        className="mb-1 text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        Power Factor
                      </p>
                      <h4 className="fw-bold" style={{ color: "#343a40" }}>
                        0.92
                      </h4>
                      <p
                        className="mb-0 text-success"
                        style={{ fontSize: "0.8rem" }}
                      >
                        Good efficiency
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                  Last 7 days
                </p>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  Your electricity usage pattern shows highest consumption
                  during evening hours (6-9 PM). Consider shifting some
                  activities to off-peak hours to optimize energy usage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default EMSIR;
