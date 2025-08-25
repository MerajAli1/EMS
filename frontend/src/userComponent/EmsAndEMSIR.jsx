import React, { useState } from "react";
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
  ArcElement,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  ArcElement
);

const EmsAndEMSIR = () => {
  // EMSUser state
  const [activeView, setActiveView] = useState("usage");
  const [timeframe, setTimeframe] = useState("24h");
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("consumption");

  // EMSIR state
  const [bedroomData] = useState({
    current: "1.2 A",
    voltage: "222 V",
    power: "250 W",
    status: "Connected to Monitoring System",
    lastSeen: "May 24, 2025 11:35 AM",
  });
  const [livingRoomData] = useState({
    current: "1.2 A",
    voltage: "222 V",
    power: "250 W",
    status: "Disconnected to Monitoring System",
    lastSeen: "May 24, 2025 11:35 AM",
  });

  // Chart data (EMSUser)
  const barColors = ["#7B68EE", "#3CB371", "#FFA500", "#00CED1"];
  const timeLabels = [
    "13:25",
    "15:25",
    "17:25",
    "19:25",
    "21:25",
    "23:25",
    "01:25",
    "03:25",
    "05:25",
    "07:25",
    "09:25",
    "11:25",
  ];
  const barData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Morning",
        backgroundColor: barColors[0],
        data: [0, 0, 0, 0, 0, 0, 0, 0, 220, 390, 360, 180],
      },
      {
        label: "Afternoon",
        backgroundColor: barColors[1],
        data: [180, 260, 250, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: "Evening",
        backgroundColor: barColors[2],
        data: [0, 0, 130, 330, 380, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        label: "Night",
        backgroundColor: barColors[3],
        data: [0, 0, 0, 0, 0, 160, 200, 160, 0, 0, 0, 0],
      },
    ],
  };
  const lineData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Total",
        data: [180, 260, 250, 330, 380, 160, 200, 160, 220, 390, 360, 180],
        borderColor: "orange",
        tension: 0.4,
        fill: false,
        pointRadius: 3,
      },
    ],
  };
  const costData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Cost",
        data: [0.3, 0.15, 0.5, 0.4, 0.6, 0.2, 0.55, 0.9, 0.5, 0.4, 0.25, 0.4],
        backgroundColor: "#007bff",
        borderWidth: 0,
        borderRadius: 3,
      },
    ],
  };
  const barOptions = {
    responsive: true,
    scales: { y: { beginAtZero: true, max: 400 } },
    plugins: { legend: { display: false } },
  };
  const lineOptions = { responsive: true, plugins: { legend: { display: false } } };
  const costOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 1.2,
        ticks: { callback: (value) => "$" + value.toFixed(2) },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => "$" + context.parsed.y.toFixed(2),
        },
      },
    },
  };

  // EMSIR chart data
  const chartData = {
    labels: ["Living Room", "Bedroom", "Kitchen"],
    datasets: [
      {
        data: [50, 30, 19],
        backgroundColor: ["#007bff", "#28a745", "#ffc107"],
        borderColor: ["#ffffff", "#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 14, family: "Inter, sans-serif" },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.label || "";
            if (label) label += ": ";
            if (context.parsed !== null) label += context.parsed + "%";
            return label;
          },
        },
      },
    },
  };

  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <div className="container py-4">
         
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <span className="me-3">May 24, 2025 11:35 AM</span>
              <span>
                Logged in as:{" "}
                <span className="text-primary">zayanikhlas786@gmail.com</span>
              </span>
            </div>
          </div>

          {/* Main content: Energy Consumption and Rooms side by side */}
          <div className="row g-4">
            {/* Energy Consumption */}
            <div className="col-lg-8">
              <div
                style={{ backgroundColor: "white" }}
                className="mb-3 p-5 rounded"
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
                      timeframe === "24h"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    } me-1`}
                    onClick={() => setTimeframe("24h")}
                  >
                    24h
                  </button>
                  <button
                    className={`btn btn-sm ${
                      timeframe === "week"
                        ? "btn-primary"
                        : "btn-outline-secondary"
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
                  <div style={{ position: "relative", height: "400px" }}>
                    <Bar data={barData} options={barOptions} />
                    <Line
                      data={lineData}
                      options={lineOptions}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ height: "400px" }}>
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
                        <span className="text-muted small">Cost per hour</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted small">$0.00</span>
                        <span className="text-muted small">$1.20</span>
                      </div>
                    </div>
                    <Bar data={costData} options={costOptions} />
                  </div>
                )}
              </div>
            </div>
            {/* Rooms */}
            <div className="col-lg-4">
              <div
                className="card shadow-sm mb-4"
                style={{ borderRadius: "15px" }}
              >
                <div className="card-body p-4">
                  <h5
                    className="card-title fw-bold mb-3"
                    style={{ color: "#343a40" }}
                  >
                    Rooms
                  </h5>
                  {/* Bed Room */}
                  <div className="mb-3">
                    <div className="fw-bold">Bed Room</div>
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-3">
                        <div className="text-muted small">Current</div>
                        <div className="fw-bold">{bedroomData.current}</div>
                      </div>
                      <div className="me-3">
                        <div className="text-muted small">Voltage</div>
                        <div className="fw-bold">{bedroomData.voltage}</div>
                      </div>
                      <div>
                        <div className="text-muted small">Power</div>
                        <div className="fw-bold">{bedroomData.power}</div>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Details</button>
                  </div>
                  {/* Living Room */}
                  <div>
                    <div className="fw-bold">Living Room</div>
                    <div className="d-flex align-items-center mb-2">
                      <div className="me-3">
                        <div className="text-muted small">Current</div>
                        <div className="fw-bold">{livingRoomData.current}</div>
                      </div>
                      <div className="me-3">
                        <div className="text-muted small">Voltage</div>
                        <div className="fw-bold">{livingRoomData.voltage}</div>
                      </div>
                      <div>
                        <div className="text-muted small">Power</div>
                        <div className="fw-bold">{livingRoomData.power}</div>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis at the end */}
          <div className="row mt-4">
            <div className="col-12">
              <div
                style={{ backgroundColor: "white" }}
                className="mb-3 p-4 rounded"
              >
                <h5 className="mb-3">Detailed Analysis</h5>
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
                {activeAnalysisTab === "consumption" && (
                  <div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Daily Average</p>
                          <h4 className="mb-0">3.2 kWh</h4>
                          <small className="text-muted">Last 7 days</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Peak Usage</p>
                          <h4 className="mb-0">735 W</h4>
                          <small className="text-muted">Today at 6:23 PM</small>
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
                {activeAnalysisTab === "costs" && (
                  <div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Monthly Estimate</p>
                          <h4 className="mb-0">$87.45</h4>
                          <small className="text-muted">Based on current usage</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Daily Average</p>
                          <h4 className="mb-0">$2.92</h4>
                          <small className="text-muted">Last 7 days</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Rate</p>
                          <h4 className="mb-0">$0.15/kWh</h4>
                          <small className="text-muted">Standard rate</small>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p>
                        Your current electricity rate is $0.15/kWh. Based on your
                        usage patterns, you could save approximately $12.40 per
                        month by optimizing usage during peak hours.
                      </p>
                    </div>
                  </div>
                )}
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
                          Consider using smart power strips for devices with standby
                          power consumption
                        </li>
                        <li>
                          Your peak usage is between 6-9 PM, try to shift high-power
                          activities
                        </li>
                        <li>
                          There's significant constant power draw at night, check for
                          always-on devices
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h6>Anomaly Detection</h6>
                      <p className="text-muted">
                        No significant anomalies detected in your recent consumption
                        patterns.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmsAndEMSIR;
