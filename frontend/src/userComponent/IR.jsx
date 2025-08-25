import React, { useEffect, useState, useMemo } from "react";
import Header from "./Navbar";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
} from "chart.js";
import Modal from "react-modal";
import { useLocation, useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip
);
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf'
// Helper functions to generate random numbers
const getRandom = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Function to generate time labels based on timeframe
const generateLabelsByTimeframe = (timeframe) => {
  const labels = [];
  const now = new Date();

  if (timeframe === "24h") {
    for (let i = 23; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = String(date.getHours()).padStart(2, "0");
      labels.push(`${hour}:00`);
    }
  } else if (timeframe === "week") {
    // 7 days
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      // Last 7 days including today
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(days[date.getDay()]);
    }
  } else if (timeframe === "month") {
    // Last 3 weeks + current week = 4 data points
    // Using current week of the year for labeling
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    const oneWeekMs = 1000 * 60 * 60 * 24 * 7;
    let currentWeekNum = Math.ceil(diff / oneWeekMs);

    for (let i = 3; i >= 0; i--) {
      const weekNum = currentWeekNum - i;
      labels.push(`Week ${weekNum}`);
    }
  }
  return labels;
};

// Generate consumption data based on timeframe and length (fixed for the session)
const generateConsumptionData = (timeframe, length) => {
  const data = [];
  for (let i = 0; i < length; i++) {
    let value;
    if (timeframe === "24h") {
      if (i >= 0 && i < 6) {
        value = getRandom(80, 120);
      } else if (i >= 6 && i < 12) {
        value = getRandom(150, 250);
      } else if (i >= 12 && i < 18) {
        value = getRandom(200, 350);
      } else {
        value = getRandom(120, 180);
      }
    } else if (timeframe === "week") {
      value = getRandom(1500, 4000);
    } else if (timeframe === "month") {
      value = getRandom(10000, 25000);
    }
    data.push(value);
  }
  return data;
};

// Generate cost data based on consumption and timeframe (will be fixed for the session)
const generateCostData = (timeframe, consumptionData) => {
  const costData = [];
  let rateMultiplier;

  if (timeframe === "24h") {
    rateMultiplier = 0.00225; // Example: $0.00225 per Watt-hour equivalent
  } else if (timeframe === "week") {
    rateMultiplier = 0.0008; // Example: $0.0008 per Watt-day equivalent
  } else if (timeframe === "month") {
    rateMultiplier = 0.00008; // Example: $0.00008 per Watt-week equivalent
  }

  consumptionData.forEach((consumption) => {
    // For fixed data, no getRandom variance here, or very minimal if desired
    let cost = consumption * rateMultiplier;

    if (timeframe === "24h") {
      cost = Math.max(0.1, Math.min(1.0, cost));
    } else if (timeframe === "week") {
      cost = Math.max(1.0, Math.min(6.0, cost));
    } else if (timeframe === "month") {
      cost = Math.max(15.0, Math.min(30.0, cost));
    }
    costData.push(parseFloat(cost.toFixed(2)));
  });
  return costData;
};

const IR = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const roomName = location.state?.roomName || "Room";

  const [activeView, setActiveView] = useState("usage");
  const [timeframe, setTimeframe] = useState("24h");
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("consumption");
  const [isServiceInactiveModalOpen, setIsServiceInactiveModalOpen] =
    useState(false);
  const [user, setUser] = useState(null);
  const [userRooms, setUserRooms] = useState([]);

  const [currentReading, setCurrentReading] = useState(0.75);
  const [voltageReading, setVoltageReading] = useState(217);
  const [powerReading, setPowerReading] = useState(162);

  // Function to handle room click
  const handleRoomClick = (room) => {
    navigate("/ir", { state: { roomName: room.roomName } });
  };

  const handleExportPdf = () => {
    // Select the main content area you want to export
    // You might need to adjust this selector based on your HTML structure
    const input = document.getElementById("dashboard-content"); // We'll add this ID below

    if (!input) {
      alert("Content area not found for PDF export.");
      console.error("Element with ID 'dashboard-content' not found.");
      return;
    }

    // Temporarily hide elements you don't want in the PDF (like the header or modals)
    // Or you can create a specific printable layout via CSS media queries.
    // For simplicity, we'll aim for the main content block.

    // Adjust the scale to improve quality for PDF
    html2canvas(input, {
      scale: 2, // Increase scale for higher resolution
      useCORS: true, // If you have images/charts from different origins
      logging: true,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4"); // 'p' for portrait, 'mm' for millimeters, 'a4' size
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save("EpsilonEMS_Dashboard.pdf");
        alert("PDF exported successfully!");
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
        alert("Failed to export PDF. Please try again.");
      });
  };

  // Use useMemo to generate data (labels, consumption, cost) only when timeframe changes.
  // These will be fixed for the session once a timeframe is chosen.
  const { labels, initialConsumptionData, initialCostData } = useMemo(() => {
    const newLabels = generateLabelsByTimeframe(timeframe);
    const newConsumptionData = generateConsumptionData(
      timeframe,
      newLabels.length
    );
    // Cost data is now generated based on the fixed consumption data for the chosen timeframe
    const newCostData = generateCostData(timeframe, newConsumptionData);

    return {
      labels: newLabels,
      initialConsumptionData: newConsumptionData,
      initialCostData: newCostData,
    };
  }, [timeframe]);

  // Initialize dynamicBarData and dynamicCostData with the memoized fixed data
  const [dynamicBarData, setDynamicBarData] = useState(() => ({
    labels: labels,
    datasets: [
      {
        label: "Total Power Consumption",
        backgroundColor: "#7B68EE",
        data: initialConsumptionData,
      },
    ],
  }));

  const [dynamicCostData, setDynamicCostData] = useState(() => ({
    labels: labels,
    datasets: [
      {
        label: "Cost",
        data: initialCostData, // Now directly from useMemo, based on fixed consumption
        backgroundColor: "#007bff",
        borderWidth: 0,
        borderRadius: 3,
      },
    ],
  }));

  // This effect ensures dynamicBarData and dynamicCostData are updated
  // whenever the `timeframe` (and thus `labels`, `initialConsumptionData`, `initialCostData`) changes.
  useEffect(() => {
    setDynamicBarData((prev) => ({
      ...prev,
      labels: labels,
      datasets: [{ ...prev.datasets[0], data: initialConsumptionData }],
    }));
    setDynamicCostData((prev) => ({
      ...prev,
      labels: labels,
      datasets: [{ ...prev.datasets[0], data: initialCostData }],
    }));
  }, [labels, initialConsumptionData, initialCostData]); // Depend on all memoized data

  const dynamicLineData = {
    labels: dynamicBarData.labels,
    datasets: [
      {
        label: "Total",
        data: dynamicBarData.datasets[0].data,
        borderColor: "orange",
        tension: 0.4,
        fill: false,
        pointRadius: 3,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: timeframe === "24h" ? 400 : timeframe === "week" ? 6000 : 30000,
      },
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit:
            timeframe === "24h" ? 12 : timeframe === "week" ? 7 : 4,
        },
      },
    },
    plugins: {
      legend: { display: true },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const costOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: timeframe === "24h" ? 1.2 : timeframe === "week" ? 8.0 : 35.0,
        ticks: {
          callback: function (value) {
            return "PKR" + value.toFixed(2);
          },
        },
      },
      x: {
        ticks: {
          autoSkip: true,
          maxTicksLimit:
            timeframe === "24h" ? 12 : timeframe === "week" ? 7 : 4,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return "PKR" + context.parsed.y.toFixed(2);
          },
        },
      },
    },
  };

  // This useEffect will now ONLY update the live metrics (Current, Voltage, Power).
  // Chart data (bar and cost) will be fixed per timeframe selection via useMemo.
  useEffect(() => {
    const updateLiveMetricsOnly = () => {
      setCurrentReading(getRandom(0.5, 1.0));
      setVoltageReading(getRandomInt(210, 240));
      setPowerReading(getRandomInt(100, 250));
    };

    const interval = setInterval(updateLiveMetricsOnly, 5000);

    return () => clearInterval(interval);
  }, []); // Empty dependency array: runs once on mount, cleans up on unmount

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        setUser(parsedUser);
        setUserRooms(parsedUser.Room || []);
        if (parsedUser.ServiceStatus === false) {
          setIsServiceInactiveModalOpen(true);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
      }
    } else {
      console.log("No user found in localStorage.");
    }
  }, []);

  return (
    <>
      <Header onExportPdf={handleExportPdf}/>
      <Modal
        isOpen={isServiceInactiveModalOpen}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEsc={false}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.99)",
            zIndex: 1000,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "500px",
            padding: "2rem",
            borderRadius: "10px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        <h2 style={{ color: "#dc3545", marginBottom: "1rem" }}>
          Service Inactive
        </h2>
        <p style={{ fontSize: "1.1rem", color: "#333" }}>
          Your service is currently **deactivated**. Please contact support for
          assistance or to reactivate your account.
        </p>
        <button
          onClick={() => {
            /* Optionally navigate to a support page or logout */ alert(
              "Please contact support to reactivate your service."
            );
          }}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "0.8rem 2rem",
            borderRadius: "999px",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "1.5rem",
          }}
        >
          Contact Support
        </button>
      </Modal>

      <div
        id="dashboard-content"
        style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}
      >
        <div className="container-fluid py-4">
          <div className="row">
            {/* Left side - Main content */}
            <div className="col-12 col-md-6 col-lg-8">
              {/* Show the selected room name at the top */}
              <h2 className="mb-4" style={{ color: "#343a40" }}>{roomName}</h2>

              <div className="text-success fw-bold mb-2">
                ● Connected to Monitoring System
              </div>
              <div className="mb-2">
                Logged in as: <span className="text-primary">{user?.Username}</span>
              </div>
              <div className="text-muted mb-4">
                {new Date().toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>

              {/* Current, Voltage, Power cards */}
              <div className="row text-center mb-4">
                <div className="col-md-4 mb-3">
                  <div
                    style={{ backgroundColor: "white" }}
                    className="border rounded p-3"
                  >
                    <div>Current</div>
                    <h3>
                      {currentReading.toFixed(2)}{" "}
                      <span className="text-muted">A</span>
                    </h3>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div
                    style={{ backgroundColor: "white" }}
                    className="border rounded p-3"
                  >
                    <div>Voltage</div>
                    <h3>
                      {voltageReading} <span className="text-muted">V</span>
                    </h3>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div
                    style={{ backgroundColor: "white" }}
                    className="border rounded p-3"
                  >
                    <div>Power</div>
                    <h3 className="text-primary">
                      {powerReading} <span className="text-muted">W</span>
                    </h3>
                  </div>
                </div>
              </div>

              {/* Energy Consumption Chart */}
              <div
                style={{ backgroundColor: "white" }}
                className="mb-3 p-4 rounded"
              >
                <h5>Energy Consumption</h5>
                <p className="text-muted">
                  Detailed view of your power consumption
                </p>

                <div className="d-flex mb-3">
                  <button
                    className={`btn ${
                      activeView === "usage"
                        ? "btn-outline-primary"
                        : "btn-outline-secondary"
                    } me-2`}
                    onClick={() => setActiveView("usage")}
                  >
                    Usage (Watts)
                  </button>
                  <button
                    className={`btn ${
                      activeView === "cost"
                        ? "btn-outline-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setActiveView("cost")}
                  >
                    Cost
                  </button>
                </div>

                <div className="d-flex justify-content-end mb-2">
                  <button
                    className={`btn btn-sm ${
                      timeframe === "24h" ? "btn-primary" : "btn-outline-secondary"
                    } me-1`}
                    onClick={() => setTimeframe("24h")}
                  >
                    24h
                  </button>
                  <button
                    className={`btn btn-sm ${
                      timeframe === "week" ? "btn-primary" : "btn-outline-secondary"
                    } me-1`}
                    onClick={() => setTimeframe("week")}
                  >
                    Week
                  </button>
                  <button
                    className={`btn btn-sm ${
                      timeframe === "month"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setTimeframe("month")}
                  >
                    Month
                  </button>
                </div>

                {activeView === "usage" ? (
                  <div style={{ position: "relative" }}>
                    <Bar
                      data={dynamicBarData}
                      options={barOptions}
                      style={{ width: "100%" }}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <div className="d-flex align-items-center mb-1">
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            backgroundColor: "#007bff",
                            marginRight: "6px",
                          }}
                        ></div>
                        <span className="text-muted small">Cost </span>
                      </div>
                    </div>
                    <Bar data={dynamicCostData} options={costOptions} />
                  </div>
                )}
              </div>

              {/* Detailed Analysis Section */}
              <div
                style={{ backgroundColor: "white" }}
                className="mb-3 p-4 rounded"
              >
                <h5 className="mb-3">Detailed Analysis</h5>

                {/* Analysis Tabs */}
                <div className="mb-4">
                  <div className="d-flex">
                    <button
                      className={`btn ${
                        activeAnalysisTab === "consumption"
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      } me-2 rounded-pill px-3`}
                      onClick={() => setActiveAnalysisTab("consumption")}
                    >
                      Consumption
                    </button>
                    <button
                      className={`btn ${
                        activeAnalysisTab === "costs"
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      } me-2 rounded-pill px-3`}
                      onClick={() => setActiveAnalysisTab("costs")}
                    >
                      Costs
                    </button>
                    <button
                      className={`btn ${
                        activeAnalysisTab === "insights"
                          ? "btn-primary"
                          : "btn-outline-secondary"
                      } rounded-pill px-3`}
                      onClick={() => setActiveAnalysisTab("insights")}
                    >
                      Insights
                    </button>
                  </div>
                </div>

                {/* Consumption View */}
                {activeAnalysisTab === "consumption" && (
                  <div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Daily Average</p>
                          <h4 className="mb-0">
                            {timeframe === "24h"
                              ? getRandom(2.5, 4.0).toFixed(1) + " kWh"
                              : timeframe === "week"
                              ? getRandom(18, 25).toFixed(1) + " kWh"
                              : getRandom(70, 100).toFixed(1) + " kWh"}
                          </h4>
                          <small className="text-muted">
                            {timeframe === "24h" ? "Today" : "Last 7 days"}
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Peak Usage</p>
                          <h4 className="mb-0">
                            {timeframe === "24h"
                              ? getRandomInt(650, 800) + " W"
                              : timeframe === "week"
                              ? getRandomInt(4000, 6000) + " W"
                              : getRandomInt(15000, 20000) + " W"}
                          </h4>
                          <small className="text-muted">
                            {timeframe === "24h"
                              ? "Today at 6:23 PM"
                              : "Last week"}
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Power Factor</p>
                          <h4 className="mb-0">0.92</h4>
                          <small className="text-muted">Good efficiency</small>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p>
                        Your electricity usage pattern shows highest consumption
                        during evening hours (6-9 PM). Consider shifting some
                        activities to off-peak hours to optimize energy usage.
                      </p>
                    </div>
                  </div>
                )}

                {/* Costs View */}
                {activeAnalysisTab === "costs" && (
                  <div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Monthly Estimate</p>
                          <h4 className="mb-0">
                            PKR
                            {timeframe === "24h"
                              ? getRandom(80, 100).toFixed(2)
                              : timeframe === "week"
                              ? getRandom(20, 35).toFixed(2)
                              : getRandom(80, 120).toFixed(2)}{" "}
                          </h4>
                          <small className="text-muted">
                            Based on current usage
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Daily Average</p>
                          <h4 className="mb-0">
                            PKR
                            {timeframe === "24h"
                              ? getRandom(2.5, 3.5).toFixed(2)
                              : timeframe === "week"
                              ? getRandom(2.0, 5.0).toFixed(2)
                              : getRandom(10.0, 15.0).toFixed(2)}{" "}
                          </h4>
                          <small className="text-muted">Last 7 days</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Rate</p>
                          <h4 className="mb-0">PKR 0.15/kWh</h4>
                          <small className="text-muted">Standard rate</small>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p>
                        Your current electricity rate is PKR 0.15/kWh. Based on
                        your usage patterns, you could save approximately PKR
                        12.40 per month by optimizing usage during peak hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* Insights View */}
                {activeAnalysisTab === "insights" && (
                  <div>
                    <div className="mb-4">
                      <h6>Energy Saving Tips</h6>
                      <p className="text-muted small">
                        Based on your consumption patterns, here are some
                        personalized recommendations:
                      </p>
                      <ul>
                        <li>
                          Consider using smart power strips for devices with
                          standby power consumption
                        </li>
                        <li>
                          Your peak usage is between 6-9 PM, try to shift
                          high-power activities
                        </li>
                        <li>
                          There's significant constant power draw at night, check
                          for always-on devices
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h6>Anomaly Detection</h6>
                      <p className="text-muted">
                        No significant anomalies detected in your recent
                        consumption patterns.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Room */}
            <div className="col-12 col-md-6 col-lg-4">
              <div
                style={{ backgroundColor: "white" }}
                className="border rounded p-4 h-100"
              >
                <h5 className="mb-3">Rooms</h5>
                <div className="row">
                  {userRooms.length > 0 ? (
                    userRooms.map((room, index) => (
                      <div key={room._id || index} className="col-12 mb-3">
                        <div 
                          className="card h-100 shadow-sm"
                          style={{ 
                            cursor: "pointer",
                            transition: "transform 0.2s",
                            border: roomName === room.roomName ? "2px solid #007bff" : "1px solid #dee2e6"
                          }}
                          onClick={() => handleRoomClick(room)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          <div className="card-body text-center">
                            <div className="mb-2">
                              <i 
                                className="fas fa-home" 
                                style={{ 
                                  fontSize: "2rem", 
                                  color: roomName === room.roomName ? "#007bff" : "#6c757d"
                                }}
                              ></i>
                            </div>
                            <h6 className="card-title mb-1">{room.roomName}</h6>
                            <small className="text-muted">
                              {room.devices?.length || 0} devices
                            </small>
                            {roomName === room.roomName && (
                              <div className="mt-2">
                                <span className="badge bg-primary">Current</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="text-center text-muted py-4">
                        <i className="fas fa-home fa-3x mb-3"></i>
                        <p>No rooms available</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IR;
