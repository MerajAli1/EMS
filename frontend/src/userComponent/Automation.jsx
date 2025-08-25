import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import Header from "../userComponent/Navbar";
import { Link } from "react-router-dom"; // Import Link for navigation

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function Automtion() {
  // State to hold the user data from localStorage
  const [user, setUser] = useState(null);
  // State to hold all rooms data, populated from the user's 'Room' array
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Attempt to retrieve user data from localStorage
    // IMPORTANT: Ensure the key "User" (capital U) matches how you store it in localStorage
    const storedUser = localStorage.getItem("user"); 

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User data loaded from localStorage:", parsedUser);

        // Check if the parsed user object contains a 'Room' array
        if (parsedUser.Room && Array.isArray(parsedUser.Room)) {
          // Map the raw room data to a format suitable for the component's display
          // and calculate poweredOn/poweredOff counts for each room's devices.
          const formattedRooms = parsedUser.Room.map((room) => {
            // Ensure devices array exists and is an array, default to empty if not
            const roomDevices = Array.isArray(room.devices) ? room.devices : [];

            // Calculate poweredOn and poweredOff devices based on the 'on' property
            const poweredOnCount = roomDevices.filter(device => device.on).length;
            const poweredOffCount = roomDevices.length - poweredOnCount;

            return {
              id: room._id, // Use _id as a unique identifier for React keys
              name: room.roomName,
              automation: room.automation, // Keep automation status
              status: room.automation ? "Connected to Automation System" : "Manual Control", // Derive status
              totalDevices: roomDevices.length,
              poweredOn: poweredOnCount,
              poweredOff: poweredOffCount,
              lastSeen: "May 24, 2025 11:35 AM", // Placeholder, update if this comes from data
              devices: roomDevices.length > 0 ? roomDevices : [
                // Default/placeholder devices if the 'devices' array is empty in localStorage.
                // These IDs are constructed to be unique per room.
                { id: `${room._id}-light1`, name: "Light 1", icon: "fas fa-lightbulb", on: true },
                { id: `${room._id}-ac`, name: "AC", icon: "fas fa-fan", on: false },
                { id: `${room._id}-fan`, name: "Fan", icon: "fas fa-fan", on: true },
              ],
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
        setRooms([]);
      }
    } else {
      console.log("No 'User' data found in localStorage. User not logged in.");
      setUser(null);
      setRooms([]);
      // In a real app, you might redirect to a login page here.
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Function to toggle device state for a specific room and device
  const toggleDevice = (roomId, deviceId) => {
    console.log(`Attempting to toggle: Room ID - ${roomId}, Device ID - ${deviceId}`);
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (room._id === roomId) {
          const updatedDevices = room.devices.map((device) => {
            if (device._id === deviceId) {
              console.log(`Toggling device: ${device.name} (ID: ${device.id}) from ${device.on} to ${!device.on}`);
              return { ...device, on: !device.on };
            }
            return device;
          });
          // Recalculate poweredOn/poweredOff counts after toggling
          const poweredOnCount = updatedDevices.filter(d => d.on).length;
          const poweredOffCount = updatedDevices.length - poweredOnCount;
          console.log(`Room "${room.name}" now has ${poweredOnCount} devices On and ${poweredOffCount} devices Off.`);

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

  // Chart data (can be made dynamic based on actual room power if available in 'rooms' state)
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
                      <Link
                        to={`/details`} // Example link to room details
                        className="btn btn-primary"
                        style={{ borderRadius: "8px", padding: "8px 20px" }}
                      >
                        Details
                      </Link>
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
                    <div className="d-flex justify-content-end mb-3">
                      <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                        Total Devices: {room.totalDevices}
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
                              className="btn w-100 d-flex flex-column align-items-center justify-content-center p-3"
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
                              onClick={() => toggleDevice(room._id, device._id)}
                            >
                              <i
                                className={`${device.icon} mb-2`}
                                style={{ fontSize: "1.8rem" }}
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
                        Save Changes
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

export default Automtion;
