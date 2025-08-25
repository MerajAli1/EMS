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

const EmsAndEmsIRAutomation = () => {
  // Chart/analysis state
  const [activeView, setActiveView] = useState("usage");
  const [timeframe, setTimeframe] = useState("24h");
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("consumption");

  // Room/automation state
  const [bedroomData] = useState({
    current: "1.2 A",
    voltage: "222 V",
    power: "250 W",
    totalDevices: 6,
    poweredOn: 3,
    poweredOff: 3,
  });
  const [livingRoomData] = useState({
    current: "1.2 A",
    voltage: "222 V",
    power: "250 W",
    totalDevices: 12,
    poweredOn: 7,
    poweredOff: 5,
  });

  // Chart data
  const barColors = ["#7B68EE", "#3CB371", "#FFA500", "#00CED1"];
  const timeLabels = [
    "13:25", "15:25", "17:25", "19:25", "21:25", "23:25", "01:25", "03:25", "05:25", "07:25", "09:25", "11:25",
  ];
  const barData = {
    labels: timeLabels,
    datasets: [
      { label: "Morning", backgroundColor: barColors[0], data: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320] },
      { label: "Afternoon", backgroundColor: barColors[1], data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { label: "Evening", backgroundColor: barColors[2], data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { label: "Night", backgroundColor: barColors[3], data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    ],
  };
  const lineData = {
    labels: timeLabels,
    datasets: [
      { label: "Total", data: [100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320], borderColor: "orange", tension: 0.4, fill: false, pointRadius: 3 },
    ],
  };
  const costData = {
    labels: timeLabels,
    datasets: [
      { label: "Estimated Cost", backgroundColor: "#007bff", data: [0.1, 0.12, 0.14, 0.16, 0.18, 0.2, 0.22, 0.24, 0.26, 0.28, 0.3, 0.32] },
    ],
  };

  // --- UI ---
  return (
    <>
      <Header />
      <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <div className="container py-4">
          {/* Topbar */}
         
          <div className="d-flex align-items-center mb-4" style={{ gap: 24 }}>
            <span className="text-success">● Connected to Monitoring System</span>
            <span>May 24, 2025 11:35 AM</span>
            <span>Logged in as: <span className="text-primary">z  ayanikhlas786@gmail.com</span></span>
          </div>

          {/* Main summary cards */}
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <div className="bg-white rounded shadow-sm p-4 text-center">
                <div className="text-muted mb-1">Current</div>
                <div style={{ fontSize: 36, fontWeight: 700 }}>0.75 <span className="text-muted" style={{ fontSize: 24 }}>A</span></div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white rounded shadow-sm p-4 text-center">
                <div className="text-muted mb-1">Voltage</div>
                <div style={{ fontSize: 36, fontWeight: 700 }}>217 <span className="text-muted" style={{ fontSize: 24 }}>V</span></div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="bg-white rounded shadow-sm p-4 text-center">
                <div className="text-muted mb-1">Power</div>
                <div style={{ fontSize: 36, fontWeight: 700 }}><span className="text-primary">162</span> <span className="text-muted" style={{ fontSize: 24 }}>W</span></div>
              </div>
            </div>
          </div>

          {/* Energy Consumption + Rooms */}
          <div className="row g-4 mb-3">
            <div className="col-lg-8">
              <div className="bg-white rounded shadow-sm p-4 mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <h5 className="mb-0">Energy Consumption</h5>
                    <div className="text-muted" style={{ fontSize: 14 }}>Detailed view of your power consumption</div>
                  </div>
                  <div>
                    <button className={`btn btn-sm ${activeView === "usage" ? "btn-primary" : "btn-outline-secondary"} me-1`} onClick={() => setActiveView("usage")}>Usage (Watts)</button>
                    <button className={`btn btn-sm ${activeView === "cost" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setActiveView("cost")}>Cost</button>
                  </div>
                </div>
                <div className="d-flex justify-content-end mb-2">
                  <button className={`btn btn-sm ${timeframe === "24h" ? "btn-primary" : "btn-outline-secondary"} me-1`} onClick={() => setTimeframe("24h")}>24h</button>
                  <button className={`btn btn-sm ${timeframe === "week" ? "btn-primary" : "btn-outline-secondary"} me-1`} onClick={() => setTimeframe("week")}>Week</button>
                  <button className={`btn btn-sm ${timeframe === "month" ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setTimeframe("month")}>Month</button>
                </div>
                {/* Graphs from EmsAndEMSIR.jsx */}
                <div className="d-flex flex-column align-items-center" style={{ background: "#f8f9fa", borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 40, fontWeight: 700, color: "#ff9800", marginBottom: 8 }}>
                    162 <span className="text-muted" style={{ fontSize: 24, fontWeight: 400 }}>W</span>
                  </div>
                  <div className="w-100" style={{ maxWidth: 600 }}>
                    {activeView === "usage" ? (
                      <Line
                        data={lineData}
                        height={220}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: '#fff',
                              titleColor: '#333',
                              bodyColor: '#333',
                              borderColor: '#ff9800',
                              borderWidth: 1,
                              titleFont: { weight: 'bold' },
                              bodyFont: { weight: 'bold' },
                              padding: 12,
                            },
                          },
                          scales: {
                            x: {
                              grid: { color: '#eee', borderDash: [4, 4] },
                              ticks: { color: '#888', font: { size: 13 } },
                            },
                            y: {
                              grid: { color: '#eee', borderDash: [4, 4] },
                              ticks: { color: '#888', font: { size: 13 } },
                              beginAtZero: true,
                              max: 400,
                            },
                          },
                          elements: {
                            line: { borderWidth: 3 },
                            point: { radius: 4, backgroundColor: '#ff9800', borderColor: '#fff', borderWidth: 2 },
                          },
                        }}
                      />
                    ) : (
                      <Bar
                        data={costData}
                        height={220}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              callbacks: {
                                label: (context) => "$" + context.parsed.y.toFixed(2),
                              },
                              backgroundColor: '#fff',
                              titleColor: '#333',
                              bodyColor: '#333',
                              borderColor: '#007bff',
                              borderWidth: 1,
                              titleFont: { weight: 'bold' },
                              bodyFont: { weight: 'bold' },
                              padding: 12,
                            },
                          },
                          scales: {
                            x: {
                              grid: { color: '#eee', borderDash: [4, 4] },
                              ticks: { color: '#888', font: { size: 13 } },
                            },
                            y: {
                              grid: { color: '#eee', borderDash: [4, 4] },
                              ticks: {
                                color: '#888', font: { size: 13 },
                                callback: (value) => "$" + value.toFixed(2),
                              },
                              beginAtZero: true,
                              max: 1.2,
                            },
                          },
                          elements: {
                            bar: { borderRadius: 3 },
                          },
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="bg-white rounded shadow-sm p-4 mb-3">
                <h5 className="mb-3">Rooms</h5>
                <div className="mb-3 p-3 border rounded">
                  <div className="fw-bold mb-2">Bed Room</div>
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <div className="text-muted small">Current</div>
                      <div className="fw-bold">{bedroomData.current}</div>
                    </div>
                    <div>
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
                <div className="p-3 border rounded">
                  <div className="fw-bold mb-2">Living Room</div>
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <div className="text-muted small">Current</div>
                      <div className="fw-bold">{livingRoomData.current}</div>
                    </div>
                    <div>
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

          {/* Automation summary */}
          <div className="bg-white rounded shadow-sm p-4 mb-4">
            <h5 className="mb-4">Automation</h5>
            <div className="row g-4">
              <div className="col-md-6">
                <div className="p-4 border rounded h-100">
                  <div className="fw-bold mb-2">Living Room</div>
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <div className="text-muted small">Total Devices</div>
                      <div className="fw-bold">{livingRoomData.totalDevices}</div>
                    </div>
                    <div>
                      <div className="text-muted small">Powered On</div>
                      <div className="fw-bold">{livingRoomData.poweredOn}</div>
                    </div>
                    <div>
                      <div className="text-muted small">Powered Off</div>
                      <div className="fw-bold">{livingRoomData.poweredOff}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm mt-2">Details</button>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-4 border rounded h-100">
                  <div className="fw-bold mb-2">Bed Room</div>
                  <div className="d-flex justify-content-between mb-2">
                    <div>
                      <div className="text-muted small">Total Devices</div>
                      <div className="fw-bold">{bedroomData.totalDevices}</div>
                    </div>
                    <div>
                      <div className="text-muted small">Powered On</div>
                      <div className="fw-bold">{bedroomData.poweredOn}</div>
                    </div>
                    <div>
                      <div className="text-muted small">Powered Off</div>
                      <div className="fw-bold">{bedroomData.poweredOff}</div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm mt-2">Details</button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white rounded shadow-sm p-4 mb-4">
            <h5 className="mb-3">Detailed Analysis</h5>
            <div className="mb-4">
              <div className="d-flex">
                <button className={`btn ${activeAnalysisTab === "consumption" ? "btn-primary" : "btn-outline-secondary"} me-2 rounded-pill px-3`} onClick={() => setActiveAnalysisTab("consumption")}>Consumption</button>
                <button className={`btn ${activeAnalysisTab === "costs" ? "btn-primary" : "btn-outline-secondary"} me-2 rounded-pill px-3`} onClick={() => setActiveAnalysisTab("costs")}>Costs</button>
                <button className={`btn ${activeAnalysisTab === "insights" ? "btn-primary" : "btn-outline-secondary"} rounded-pill px-3`} onClick={() => setActiveAnalysisTab("insights")}>Insights</button>
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
                      <small className="text-muted">Today at 7:30 PM</small>
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
                  <p>Your electricity usage pattern shows highest consumption during evening hours (6-9 PM). Consider shifting some activities to off-peak hours to optimize energy usage.</p>
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
                  <p>Your current electricity rate is $0.15/kWh. Based on your usage patterns, you could save approximately $12.40 per month by optimizing usage during peak hours.</p>
                </div>
              </div>
            )}
            {activeAnalysisTab === "insights" && (
              <div>
                <div className="mb-4">
                  <h6>Energy Saving Tips</h6>
                  <p className="text-muted small">Based on your consumption patterns, here are some personalized recommendations:</p>
                  <ul>
                    <li>Consider using smart power strips for devices with standby power consumption</li>
                    <li>Your peak usage is between 6-9 PM, try to shift high-power activities</li>
                    <li>There's significant constant power draw at night, check for always-on devices</li>
                  </ul>
                </div>
                <div>
                  <h6>Anomaly Detection</h6>
                  <p className="text-muted">No significant anomalies detected in your recent consumption patterns.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmsAndEmsIRAutomation;