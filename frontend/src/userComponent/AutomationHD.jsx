import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Header from "../userComponent/Navbar"; // Assuming Navbar is correctly imported

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function AutomationHD() {
  // State to hold the parsed user data from localStorage
  const [user, setUser] = useState(null);
  // State to hold all rooms data, populated from the user's 'Room' array
  const [rooms, setRooms] = useState([]);

  // Helper function to process raw device data from localStorage
  const processDevices = (rawDevices, roomId) => {
    return Array.isArray(rawDevices) ? rawDevices.map(device => ({
      // Use _id from localStorage if available, otherwise fallback to a generated ID
      id: device._id || `${roomId}-${device.name}-${Math.random().toString(36).substr(2, 9)}`,
      name: device.name || 'Unknown Device',
      icon: device.icon || 'fas fa-question-circle', // Default icon if missing
      on: typeof device.on === 'boolean' ? device.on : false, // Default to false if 'on' is missing
      humanDetection: typeof device.humanDetection === 'boolean' ? device.humanDetection : false, // Default to false if 'humanDetection' is missing
    })) : [];
  };

  // Effect to load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User data loaded from localStorage:", parsedUser);

        // Process rooms from parsedUser.Room
        if (parsedUser.Room && Array.isArray(parsedUser.Room)) {
          const formattedRooms = parsedUser.Room.map((room) => {
            const processedDevices = processDevices(room.devices, room._id);
            const poweredOnCount = processedDevices.filter(d => d.on).length;
            const poweredOffCount = processedDevices.length - poweredOnCount;

            return {
              id: room._id, // Use _id as the unique identifier for the room
              name: room.roomName,
              automation: room.automation,
              status: room.automation ? "Connected to Automation System" : "Manual Control",
              totalDevices: processedDevices.length,
              poweredOn: poweredOnCount,
              poweredOff: poweredOffCount,
              lastSeen: "May 24, 2025 11:35 AM", // Placeholder, update if this comes from data
              devices: processedDevices,
            };
          });
          setRooms(formattedRooms);
        } else {
          console.warn("No 'Room' array found in localStorage user data or it's not an array.");
          setRooms([]); // Set rooms to empty if no valid 'Room' data
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUser(null);
        setRooms([]); // Clear rooms on error
      }
    } else {
      console.log("No 'user' data found in localStorage. User not logged in.");
      setUser(null);
      setRooms([]); // Clear rooms if no user data
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Function to toggle device state for a specific room and device
  const toggleDevice = (roomId, deviceId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          const updatedDevices = room.devices.map((device) =>
            device.id === deviceId ? { ...device, on: !device.on } : device
          );
          const poweredOnCount = updatedDevices.filter(d => d.on).length;
          const poweredOffCount = updatedDevices.length - poweredOnCount;
          return {
            ...room,
            devices: updatedDevices,
            poweredOn: poweredOnCount,
            poweredOff: poweredOffCount,
          };
        }
        return room;
      })
    );
  };

  // Function to toggle human detection for a specific room and device
  const toggleHumanDetection = (roomId, deviceId) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room.id === roomId) {
          const updatedDevices = room.devices.map((device) =>
            device.id === deviceId ? { ...device, humanDetection: !device.humanDetection } : device
          );
          return {
            ...room,
            devices: updatedDevices,
          };
        }
        return room;
      })
    );
  };

  // Chart data (now dynamic based on loaded rooms)
  const chartData = {
    labels: rooms.map(room => room.name), // Dynamically set labels from room names
    datasets: [
      {
        // For demonstration, assigning dummy percentages.
        // In a real app, this would be based on actual energy consumption data.
        data: rooms.length > 0 ? rooms.map((room, index) => {
            const percentages = [50, 30, 19, 25, 15, 10]; // Example percentages for up to 6 rooms
            return percentages[index % percentages.length] || 0;
        }) : [100], // Default to 100% if no rooms for chart display
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#17a2b8", "#6f42c1"], // More colors
        borderColor: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
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
      <div style={{ backgroundColor: "#f8f9fa" }}>
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
            <span>{new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}</span>
            <span>
              Logged in as: {user ? user.Username : "Guest"}
            </span>
          </div>

          {/* Dynamically rendered Room Automation Sections */}
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <React.Fragment key={room.id}>
                {/* Room Monitoring Section */}
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
                        {room.name}
                      </h5>
                      <span
                        className={`${
                          room.automation ? "text-success" : "text-danger"
                        } fw-bold d-flex align-items-center`}
                      >
                        <i
                          className="fas fa-circle me-2"
                          style={{ fontSize: "0.7rem" }}
                        ></i>{" "}
                        {room.status}
                      </span>
                    </div>
                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <div
                          className="card h-100 p-3 text-center"
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f0f2f5",
                          }}
                        >
                          <p
                            className="mb-1 text-muted"
                            style={{ fontSize: "0.85rem" }}
                          >
                            Total Devices
                          </p>
                          <h3 className="fw-bold" style={{ color: "#343a40" }}>
                            {room.totalDevices}
                          </h3>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div
                          className="card h-100 p-3 text-center"
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f0f2f5",
                          }}
                        >
                          <p
                            className="mb-1 text-muted"
                            style={{ fontSize: "0.85rem" }}
                          >
                            Powered On
                          </p>
                          <h3
                            className="fw-bold text-success"
                            style={{ color: "#28a745" }}
                          >
                            {room.poweredOn}
                          </h3>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div
                          className="card h-100 p-3 text-center"
                          style={{
                            borderRadius: "10px",
                            backgroundColor: "#f0f2f5",
                          }}
                        >
                          <p
                            className="mb-1 text-muted"
                            style={{ fontSize: "0.85rem" }}
                          >
                            Powered Off
                          </p>
                          <h3
                            className="fw-bold text-danger"
                            style={{ color: "#dc3545" }}
                          >
                            {room.poweredOff}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button
                        className="btn btn-primary"
                        style={{ borderRadius: "8px", padding: "8px 20px" }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Device Control Section for the current room */}
                <div
                  className="card shadow-sm mb-4"
                  style={{ borderRadius: "15px" }}
                >
                  <div className="card-body p-4">
                    <h5
                      className="card-title fw-bold mb-3"
                      style={{ color: "#343a40" }}
                    >
                      {room.name} Devices
                    </h5>
                    <div className="d-flex justify-content-start align-items-center mb-3" style={{ gap: '2rem' }}>
                      <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
                        Total Devices: {room.devices.length}
                      </span>
                      <span className="fw-bold" style={{ fontSize: '1.1rem' }}>
                        In Human Detection: {room.devices.filter(d => d.humanDetection).length}
                      </span>
                    </div>
                    <div className="row g-3">
                      {room.devices.length > 0 ? (
                        room.devices.map((device) => (
                          <div
                            key={device.id}
                            className="col-6 col-sm-4 col-md-3 col-lg-2"
                          >
                            <button
                              className="btn w-100 d-flex flex-column align-items-center justify-content-center p-3 position-relative"
                              style={{
                                borderRadius: "10px",
                                height: "100px",
                                backgroundColor: device.on ? "#007bff" : "#f0f2f5",
                                color: device.on ? "#ffffff" : "#343a40",
                                border: device.on ? "none" : "1px solid #ced4da",
                                boxShadow: device.on
                                  ? "0 4px 8px rgba(0, 123, 255, 0.2)"
                                  : "none",
                                transition: "all 0.2s ease-in-out",
                              }}
                              onClick={() => toggleDevice(room.id, device.id)}
                            >
                              <div className="d-flex align-items-center position-absolute" style={{ top: 8, left: 8, zIndex: 2 }} onClick={e => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  className="form-check-input me-1"
                                  checked={!!device.humanDetection}
                                  onChange={() => toggleHumanDetection(room.id, device.id)}
                                  id={`hd-${room.id}-${device.id}`} // Unique ID for checkbox
                                  style={{ cursor: 'pointer' }}
                                />
                                <label htmlFor={`hd-${room.id}-${device.id}`} style={{ fontSize: '0.7rem', cursor: 'pointer', marginBottom: 0, color: device.on ? '#fff' : '#343a40' }}>
                                  Human Detection
                                </label>
                              </div>
                              <i
                                className={`${device.icon} mb-2`}
                                style={{ fontSize: "1.8rem", marginTop: '18px' }}
                              ></i>
                              <span
                                className="fw-bold"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {device.name}
                              </span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="col-12 text-center text-muted">
                          No devices configured for this room.
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-end mt-4">
                      <button
                        className="btn btn-primary"
                        style={{ borderRadius: "8px", padding: "8px 20px" }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))
          ) : (
            <div className="alert alert-info text-center" role="alert">
              No rooms found for this user. Please ensure you are logged in and have rooms configured.
            </div>
          )}

          {/* Room Energy Usage Section (Doughnut Chart) */}
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
                      {/* Central text for total usage can be added here */}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex flex-column justify-content-center h-100">
                    {rooms.length > 0 ? (
                      chartData.labels.map((label, index) => (
                        <div className="d-flex align-items-center mb-2" key={`chart-legend-${label}`}>
                          <span
                            className="me-2"
                            style={{
                              width: "15px",
                              height: "15px",
                              borderRadius: "50%",
                              backgroundColor: chartData.datasets[0].backgroundColor[index % chartData.datasets[0].backgroundColor.length],
                            }}
                          ></span>
                          <span className="fw-bold" style={{ color: "#343a40" }}>
                            {label}{" "}
                            <span className="text-muted fw-normal">
                              {chartData.datasets[0].data[index]} %
                            </span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No room data for chart.</p>
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
    </>
  );
}

export default AutomationHD;
