import React, { useEffect, useState, useMemo } from "react";
import Header from "./Navbar";
import { faLightbulb, faCheckCircle, faExclamationCircle, faChevronRight, faExpand } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import bulb_image from '../assets/bulb_Ai-Analysis.png'
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
  Title,
} from "chart.js";
import Modal from "react-modal";
import { database } from "../../firebaseConfig/firebase";
import "./EMSUSER.css";

// Import the specific Firebase functions you'll use
import {
  ref,
  onValue,
  query,
  limitToLast,
  orderByChild,
} from "firebase/database";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Title,
  Tooltip
);


import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Sidebar from "./sidebar";
import axios from "axios";
import { Badge, Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from "react-bootstrap";
// Helper functions to generate random numbers
const getRandom = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Function to process Firebase energy data based on timeframe
const processFirebaseEnergyData = (firebaseData, timeframe) => {
  if (!firebaseData || Object.keys(firebaseData).length === 0) {
    return { labels: [], data: [] };
  }

  // Convert Firebase object to array and sort by timestamp
  const energyEntries = Object.values(firebaseData)
    .filter((entry) => entry.timestamp && entry.energy_used !== undefined)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (energyEntries.length === 0) {
    return { labels: [], data: [] };
  }

  const now = new Date();
  let filteredData = [];

  if (timeframe === "24h") {
    // Get data from last 24 hours
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    filteredData = energyEntries.filter(
      (entry) => new Date(entry.timestamp) >= last24Hours
    );

    // Group by hour
    const hourlyData = {};
    filteredData.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const hourKey = `${hour}:00`;

      if (!hourlyData[hourKey]) {
        hourlyData[hourKey] = [];
      }
      hourlyData[hourKey].push(parseFloat(entry.energy_used) || 0);
    });

    // Create labels for last 24 hours
    const labels = [];
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000).getHours();
      const hourKey = `${hour}:00`;
      labels.push(hourKey);

      if (hourlyData[hourKey]) {
        // Sum all energy readings for this hour
        const hourSum = hourlyData[hourKey].reduce((sum, val) => sum + val, 0);
        data.push(hourSum);
      } else {
        data.push(0);
      }
    }

    return { labels, data };
  } else if (timeframe === "week") {
    // Get data from last 7 days
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredData = energyEntries.filter(
      (entry) => new Date(entry.timestamp) >= lastWeek
    );

    // Group by day
    const dailyData = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    filteredData.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const dayName = days[date.getDay()];

      if (!dailyData[dayName]) {
        dailyData[dayName] = [];
      }
      dailyData[dayName].push(parseFloat(entry.energy_used) || 0);
    });

    const labels = [];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayName = days[date.getDay()];
      labels.push(dayName);

      if (dailyData[dayName]) {
        const daySum = dailyData[dayName].reduce((sum, val) => sum + val, 0);
        data.push(daySum);
      } else {
        data.push(0);
      }
    }

    return { labels, data };
  } else if (timeframe === "month") {
    // Get data from last 4 weeks
    const lastMonth = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    filteredData = energyEntries.filter(
      (entry) => new Date(entry.timestamp) >= lastMonth
    );

    // Group by week
    const weeklyData = {};
    filteredData.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const weekStart = new Date(
        date.getTime() - date.getDay() * 24 * 60 * 60 * 1000
      );
      const weekKey = `Week ${Math.ceil(
        (weekStart.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
      )}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(parseFloat(entry.energy_used) || 0);
    });

    const labels = [];
    const data = [];
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const currentWeek = Math.ceil(
      (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    for (let i = 3; i >= 0; i--) {
      const weekNum = currentWeek - i;
      const weekKey = `Week ${weekNum}`;
      labels.push(weekKey);

      if (weeklyData[weekKey]) {
        const weekSum = weeklyData[weekKey].reduce((sum, val) => sum + val, 0);
        data.push(weekSum);
      } else {
        data.push(0);
      }
    }

    return { labels, data };
  }

  return { labels: [], data: [] };
};

// Function to generate time labels based on timeframe
const generateLabelsByTimeframe = (timeframe) => {
  const labels = [];
  const now = new Date();

  if (timeframe === "24h") {
    // Generate hours from 12 PM (noon) to 6 AM next day
    for (let hour = 12; hour <= 30; hour++) {
      // 30 = 6 AM next day (24 + 6)
      const displayHour = hour % 24; // Convert to 24-hour format
      labels.push(`${displayHour === 0 ? 24 : displayHour}`); // Show 24 instead of 0
    }
  } else if (timeframe === "week") {
    // 7 days
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      labels.push(days[date.getDay()]);
    }
  } else if (timeframe === "month") {
    // Last 3 weeks + current week = 4 data points
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    const oneWeekMs = 1000 * 60 * 60 * 24 * 7;
    let currentWeekNum = Math.ceil(diff / oneWeekMs);

    for (let i = 3; i >= 0; i--) {
      labels.push(`Week ${currentWeekNum - i}`);
    }
  }
  return labels;
};
const calculateMonthlyConsumption = (power) => {
  // Get the current date
  const now = new Date();
  const currentDay = now.getDate(); // Day of the month (1-31)
  const currentMonth = now.getMonth(); // Month (0-11)
  const currentYear = now.getFullYear();

  // Calculate days passed in current month
  const daysPassed = currentDay;

  // Calculate average daily consumption (kW * hours)
  const dailyConsumption = (power * 24) / 1000; // kWh

  // Estimate monthly consumption
  const monthlyEstimate = dailyConsumption * 30; // Project to 30 days

  // Or alternatively, scale up based on days passed:
  // const monthlyEstimate = dailyConsumption * daysPassed;

  return {
    estimate: parseFloat(monthlyEstimate.toFixed(2)),
    lastUpdated: now,
  };
};

// Generate consumption data in kWh based on timeframe and length
const generateConsumptionData = (timeframe, length) => {
  const data = [];
  for (let i = 0; i < length; i++) {
    let value;

    const voltage = getRandom(237, 242);
    const current = getRandom(1.5, 3.5);
    const power = voltage * current;

    if (timeframe === "24h") {
      // For hourly data, we'll assume this power was used for 1 hour
      value = power / 1000; // Convert to kWh
    } else if (timeframe === "week") {
      // For daily data, assume this power was used for 24 hours
      value = (power * 24) / 1000; // Convert to kWh
    } else if (timeframe === "month") {
      // For weekly data, assume this power was used for 24*7 hours
      value = (power * 24 * 7) / 1000; // Convert to kWh
    }

    // Add some variation to make the data more realistic
    value = value * getRandom(0.8, 1.2);
    data.push(parseFloat(value.toFixed(2)));
  }
  return data;
};

// Generate cost data based on consumption and timeframe
const generateCostData = (timeframe, consumptionData) => {
  const costData = [];
  const rate = 44; // Updated to PKR 44 per kWh

  consumptionData.forEach((consumption) => {
    let cost = consumption * rate;
    costData.push(parseFloat(cost.toFixed(2)));
  });
  return costData;
};

const usageCostOptions = {
  responsive: true,
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "PKR",
      },
    },
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 12, // Show about 12 labels for better readability
      },
      grid: {
        display: false,
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
          return `PKR ${context.parsed.y.toFixed(2)}`;
        },
      },
    },
  },
  maintainAspectRatio: false,
};
const EpsilonEMS = () => {
  const [activeView, setActiveView] = useState("usage");
  const [timeframe, setTimeframe] = useState("24h");
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("consumption");
  const [isServiceInactiveModalOpen, setIsServiceInactiveModalOpen] =
    useState(false);
  const [usageCostTimeframe, setUsageCostTimeframe] = useState("today");
  const [deviceStatus, setDeviceStatus] = useState("Online");
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [latestEnergyReading, setLatestEnergyReading] = useState(null);
  const [powerFactorReading, setPowerFactorReading] = useState(null);
  const [usageCostData, setUsageCostData] = useState({
    today: {
      labels: [],
      data: [],
    },
    week: {
      labels: [],
      data: [],
    },
    month: {
      labels: [],
      data: [],
    },
  });

  const [user, setUser] = useState(null);
  const [unitsConsumedThisMonth, setUnitsConsumedThisMonth] = useState(() => {
    // Initialize with a random value between 50-70
    return (Math.random() * 20 + 50).toFixed(2);
  });
  const [lastUpdatedDate, setLastUpdatedDate] = useState(null);

  const [currentReading, setCurrentReading] = useState(0);
  const [voltageReading, setVoltageReading] = useState(0);
  const [powerReading, setPowerReading] = useState(0);

  // New state for Firebase energy data
  const [firebaseEnergyData, setFirebaseEnergyData] = useState({});
  const [isLoadingEnergyData, setIsLoadingEnergyData] = useState(true);

  // Calculate consumption metrics from Firebase data
  const calculateConsumptionMetrics = useMemo(() => {
    if (!firebaseEnergyData || Object.keys(firebaseEnergyData).length === 0) {
      return {
        dailyAverage: 0,
        peakUsage: 0,
        totalMonthlyConsumption: 0,
        peakTime: "N/A",
        peakDate: "N/A",
      };
    }

    const energyEntries = Object.values(firebaseEnergyData)
      .filter((entry) => entry.timestamp && entry.energy_used !== undefined)
      .map((entry) => ({
        ...entry,
        energy_used: parseFloat(entry.energy_used) || 0,
        timestamp: new Date(entry.timestamp),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (energyEntries.length === 0) {
      return {
        dailyAverage: 0,
        peakUsage: 0,
        totalMonthlyConsumption: 0,
        peakTime: "N/A",
        peakDate: "N/A",
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter data for current month
    const currentMonthData = energyEntries.filter(
      (entry) =>
        entry.timestamp.getMonth() === currentMonth &&
        entry.timestamp.getFullYear() === currentYear
    );

    // Calculate total monthly consumption
    const totalMonthlyConsumption = currentMonthData.reduce(
      (sum, entry) => sum + entry.energy_used,
      0
    );

    // Calculate daily average (based on days passed in current month)
    const currentDay = now.getDate();
    const dailyAverage =
      currentDay > 0 ? totalMonthlyConsumption / currentDay : 0;

    // Find peak usage and time
    const peakEntry = energyEntries.reduce((peak, entry) => {
      return entry.energy_used > peak.energy_used ? entry : peak;
    }, energyEntries[0] || { energy_used: 0, timestamp: now });

    const peakTime = peakEntry.timestamp.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const peakDate = peakEntry.timestamp.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const peakDateTime = `${peakTime} on ${peakDate}`;

    return {
      dailyAverage: parseFloat(dailyAverage.toFixed(3)),
      peakUsage: parseFloat(peakEntry.energy_used.toFixed(3)),
      totalMonthlyConsumption: parseFloat(totalMonthlyConsumption.toFixed(3)),
      peakTime: peakDateTime,
      peakDate: peakDate,
    };
  }, [firebaseEnergyData]);

  // Calculate cost metrics from consumption data
  const calculateCostMetrics = useMemo(() => {
    const rate = 44; // PKR per kWh
    const { dailyAverage, totalMonthlyConsumption } =
      calculateConsumptionMetrics;

    const monthlyEstimate = totalMonthlyConsumption * rate;
    const dailyAverageCost = dailyAverage * rate;

    // Estimate potential savings (assuming 10% reduction during peak hours)
    const potentialSavings = monthlyEstimate * 0.1;

    return {
      monthlyEstimate: parseFloat(monthlyEstimate.toFixed(2)),
      dailyAverageCost: parseFloat(dailyAverageCost.toFixed(2)),
      potentialSavings: parseFloat(potentialSavings.toFixed(2)),
      rate: rate,
    };
  }, [calculateConsumptionMetrics]);

  const handleExportPdf = () => {
    const input = document.getElementById("dashboard-content");

    if (!input) {
      alert("Content area not found for PDF export.");
      console.error("Element with ID 'dashboard-content' not found.");
      return;
    }

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: true,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;
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

  useEffect(() => {
    const userString = localStorage.getItem("user");
    let userId = "user0001";
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        if (parsedUser.UserId) {
          userId = parsedUser.UserId;
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    // Fetch energy data from Firebase
    const energyRef = ref(database, `${userId}/energy`);
    const unsubscribeEnergy = onValue(energyRef, (snapshot) => {
      const energyData = snapshot.val();
      console.log("Energy data from Firebase:", energyData);
      setFirebaseEnergyData(energyData || {});
      setIsLoadingEnergyData(false);
    });

    const readingsRef = ref(database, `${userId}/essentials`);
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const essentialsData = snapshot.val();
      if (essentialsData) {
        setCurrentReading(essentialsData.current || 0);
        setVoltageReading(essentialsData.voltage || 0);
        setPowerReading(essentialsData.power || 0);

        // More realistic calculation for Pakistani household consumption
        if (essentialsData.power) {
          // Calculate base consumption (2-3 kWh per day)
          const baseDailyConsumption = 2 + Math.random();

          // Get current day of month (1-31)
          const currentDay = new Date().getDate();

          // Calculate monthly estimate (base * days passed * variance factor)
          const monthlyEstimate = (
            baseDailyConsumption *
            currentDay *
            (0.9 + Math.random() * 0.2)
          ).toFixed(2);

          // Ensure it stays between 50-70 if we're in second half of month
          if (currentDay > 15) {
            const adjustedEstimate = Math.min(
              70,
              Math.max(50, monthlyEstimate)
            );
            setUnitsConsumedThisMonth(adjustedEstimate);
          } else {
            // For first half of month, show proportional consumption
            setUnitsConsumedThisMonth(monthlyEstimate);
          }
        }
      }
    });

    return () => {
      unsubscribe();
      unsubscribeEnergy();
    };
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        setUser(parsedUser);
        if (parsedUser.ServiceStatus === false) {
          setIsServiceInactiveModalOpen(true);
        }

        // Fetch and compare units notification on login
        if (parsedUser.UserId) {
          fetchAndCompareUnitsNotification(parsedUser.UserId);
        }
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
      }
    } else {
      console.log("No user found in localStorage.");
    }
  }, []);

  // Fetch the latest current, voltage, and power from Firebase Realtime Database and update the readings in real time.
  useEffect(() => {
    const userString = localStorage.getItem("user");
    let userId = "user0001";
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        if (parsedUser.UserId) {
          userId = parsedUser.UserId;
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    const readingsRef = ref(database, `${userId}/essentials`);
    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const essentialsData = snapshot.val();
      const currentTime = new Date();
      setLastUpdateTime(currentTime); // Update last update time

      if (essentialsData) {
        setCurrentReading(essentialsData.current || 0);
        setVoltageReading(essentialsData.voltage || 0);
        setPowerReading(essentialsData.power || 0);
        setPowerFactorReading(essentialsData.power_factor || 0);

        // Mark as online since we just got fresh data

        // Calculate monthly usage
        const monthlyUsage = ((essentialsData.power || 0) * 24 * 30) / 1000;
        setUnitsConsumedThisMonth(parseFloat(monthlyUsage.toFixed(2)));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    let userId = "user0001";
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        if (parsedUser.UserId) {
          userId = parsedUser.UserId;
        }
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    // Query energy data ordered by timestamp and get the latest entry
    const energyRef = query(
      ref(database, `${userId}/energy`),
      orderByChild("timestamp"),
      limitToLast(1) // Only get the most recent reading
    );

    const unsubscribe = onValue(energyRef, (snapshot) => {
      const energyData = snapshot.val();
      console.log("Latest energy data from Firebase:", energyData);
      if (energyData) {
        console.log("Latest energy data from Firebase 2:", energyData);
        // Get the most recent entry (will be only one due to limitToLast(1))
        const entries = Object.values(energyData);
        const latestEntry = entries[0];
        console.log("abc");
        setLatestEnergyReading(latestEntry);
        setLastUpdateTime(new Date());
        console.log("def");

        // Check if timestamp is older than 1 hour
        const entryTime = new Date(latestEntry.timestamp);
        const currentTime = new Date();
        const hoursDiff = (currentTime - entryTime) / (1000 * 60 * 60);
        console.log("hour differcence", hoursDiff);
        // Determine status
        if (
          latestEntry &&
          parseFloat(latestEntry.energy_used) > 0 &&
          hoursDiff <= 1
        ) {
          setDeviceStatus("Active");
        } else {
          setDeviceStatus("Inactive");
          // Optional: Log why it's inactive
          if (hoursDiff > 1) {
            console.log(
              `Marking inactive due to stale data (${hoursDiff.toFixed(
                1
              )} hours old)`
            );
          } else {
            console.log("Marking inactive due to zero energy usage");
          }
        }
      } else {
        // No data available
        setDeviceStatus("Inactive");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseEnergyData || Object.keys(firebaseEnergyData).length === 0)
      return;

    const now = new Date();
    const rate = 44; // PKR per kWh

    // Process today's data - hourly
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const todayEntries = Object.values(firebaseEnergyData)
      .filter((entry) => new Date(entry.timestamp) >= todayStart)
      .map((entry) => ({
        ...entry,
        energy_used: parseFloat(entry.energy_used) || 0,
        timestamp: new Date(entry.timestamp),
      }));

    // Initialize hourly data
    const hourlyData = Array(24)
      .fill(0)
      .map((_, i) => ({
        hour: i,
        consumption: 0,
      }));

    // Group by hour
    todayEntries.forEach((entry) => {
      const hour = entry.timestamp.getHours();
      hourlyData[hour].consumption += entry.energy_used;
    });

    const todayData = {
      labels: hourlyData.map((_, i) => `${i}:00`),
      data: hourlyData.map((hour) => hour.consumption * rate), // Convert to PKR
    };

    // Process week data (same as before)
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekEntries = Object.values(firebaseEnergyData)
      .filter((entry) => new Date(entry.timestamp) >= weekStart)
      .map((entry) => ({
        ...entry,
        energy_used: parseFloat(entry.energy_used) || 0,
        timestamp: new Date(entry.timestamp),
      }));

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekDataByDay = days.map((day) => []);

    weekEntries.forEach((entry) => {
      const dayIndex = entry.timestamp.getDay();
      weekDataByDay[dayIndex].push(entry.energy_used);
    });

    const weekData = {
      labels: days,
      data: weekDataByDay.map(
        (dayData) => dayData.reduce((sum, val) => sum + val, 0) * rate
      ),
    };

    // Process month data (same as before)
    const monthStart = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const monthEntries = Object.values(firebaseEnergyData)
      .filter((entry) => new Date(entry.timestamp) >= monthStart)
      .map((entry) => ({
        ...entry,
        energy_used: parseFloat(entry.energy_used) || 0,
        timestamp: new Date(entry.timestamp),
      }));

    // Group by week
    const weeklyData = {};
    monthEntries.forEach((entry) => {
      const weekNum = Math.floor(
        (entry.timestamp - monthStart) / (7 * 24 * 60 * 60 * 1000)
      );
      const weekKey = `Week ${weekNum + 1}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(entry.energy_used);
    });

    const monthData = {
      labels: Object.keys(weeklyData),
      data: Object.values(weeklyData).map(
        (weekData) => weekData.reduce((sum, val) => sum + val, 0) * rate
      ),
    };

    setUsageCostData({
      today: todayData,
      week: weekData,
      month: monthData,
    });
  }, [firebaseEnergyData]);

  // Use useMemo to generate data (labels, consumption, cost) based on Firebase data and timeframe
  const { labels, initialConsumptionData, initialCostData } = useMemo(() => {
    console.log("Processing data for timeframe:", timeframe);
    console.log("Firebase energy data:", firebaseEnergyData);

    if (isLoadingEnergyData || Object.keys(firebaseEnergyData).length === 0) {
      // Return fallback data while loading or if no data available
      const fallbackLabels =
        timeframe === "24h"
          ? Array.from({ length: 24 }, (_, i) => `${i}:00`)
          : timeframe === "week"
            ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            : ["Week 1", "Week 2", "Week 3", "Week 4"];

      const fallbackData = Array(fallbackLabels.length).fill(0);
      const fallbackCostData = fallbackData.map((val) => val * 44); // PKR 44 per kWh

      return {
        labels: fallbackLabels,
        initialConsumptionData: fallbackData,
        initialCostData: fallbackCostData,
      };
    }

    // Process real Firebase data
    const { labels: processedLabels, data: processedData } =
      processFirebaseEnergyData(firebaseEnergyData, timeframe);

    // Generate cost data based on consumption
    const costData = processedData.map((consumption) => {
      const rate = 44; // PKR 44 per kWh
      return parseFloat((consumption * rate).toFixed(2));
    });

    console.log("Processed labels:", processedLabels);
    console.log("Processed data:", processedData);
    console.log("Cost data:", costData);

    return {
      labels: processedLabels,
      initialConsumptionData: processedData,
      initialCostData: costData,
    };
  }, [timeframe, firebaseEnergyData, isLoadingEnergyData]);

  const [dynamicBarData, setDynamicBarData] = useState(() => ({
    labels: labels,
    datasets: [
      {
        label: "Energy Consumption (kWh)",
        backgroundColor: "#775F83",
        data: initialConsumptionData,
      },
    ],
  }));

  const [dynamicCostData, setDynamicCostData] = useState(() => ({
    labels: labels,
    datasets: [
      {
        label: "Cost (PKR)",
        data: initialCostData,
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
    ],
  }));

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
  }, [labels, initialConsumptionData, initialCostData]);

  const dynamicLineData = {
    labels: labels,
    datasets: [
      {
        label: "Energy Consumption (kWh)",
        data: initialConsumptionData,
        borderColor: "#775F83",
        backgroundColor: "rgba(123, 104, 238, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "kWh",
        },
        // Dynamic max based on actual data
        max:
          Math.max(...initialConsumptionData) * 1.2 ||
          (timeframe === "24h" ? 1.0 : timeframe === "week" ? 25 : 500),
      },
      x: {
        ticks: {
          autoSkip: timeframe === "24h" ? false : true,
          maxRotation: timeframe === "24h" ? 45 : 0,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(
              3
            )} kWh`;
          },
          afterLabel: function (context) {
            if (timeframe === "24h") {
              return `Time: ${context.label}`;
            }
            return "";
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 6,
      },
    },
  };

  const costOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "PKR",
        },
        // Dynamic max based on actual cost data
        max:
          Math.max(...initialCostData) * 1.2 ||
          (timeframe === "24h" ? 50 : timeframe === "week" ? 1000 : 10000),
        ticks: {
          callback: function (value) {
            return "PKR " + value.toFixed(2);
          },
        },
      },
      x: {
        ticks: {
          autoSkip: timeframe === "24h" ? false : true,
          maxRotation: timeframe === "24h" ? 45 : 0,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return "PKR " + context.parsed.y.toFixed(2);
          },
        },
      },
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.4,
      },
      point: {
        radius: 3,
        hoverRadius: 6,
      },
    },
  };

  // --- Units Notification API Integration ---
  const units = 200; // Fixed variable for comparison
  const [unitsNotificationValue, setUnitsNotitivecationValue] = useState("");
  const [unitsNotificationMsg, setUnitsNotificationMsg] = useState("");
  const [isUnitsNotificationModalOpen, setIsUnitsNotificationModalOpen] =
    useState(false);
  const [isUnitsThresholdModalOpen, setIsUnitsThresholdModalOpen] =
    useState(false);
  const [currentUnitsNotification, setCurrentUnitsNotification] = useState(0);
  const monthlyGoal =
    currentUnitsNotification > 0 ? currentUnitsNotification : 200; // fallback if not set
  const monthlyConsumed =
    calculateConsumptionMetrics.totalMonthlyConsumption || 0;
  const monthlyProgress = Math.min((monthlyConsumed / monthlyGoal) * 100, 100);

  // Function to fetch and compare units notification
  const fetchAndCompareUnitsNotification = async (UserId) => {
    try {
      const response = await axios.get(
        `https://emsbackend-eight.vercel.app/api/user/getUnitsNotification?UserId=${UserId}`
      );
      console.log("Get units notification response:", response.data);

      const fetchedUnits = Number(response.data.unitsNotification);
      setCurrentUnitsNotification(fetchedUnits);

      // Compare with fixed units variable
      if (fetchedUnits > units) {
        setIsUnitsThresholdModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching units notification:", error);
    }
  };

  const handleUnitsNotificationSubmit = async (e) => {
    e.preventDefault();
    const userString = localStorage.getItem("user");
    let UserId = null;
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        UserId = parsedUser.UserId;
      } catch (err) {
        setUnitsNotificationMsg("User not found. Please login again.");
        setIsUnitsNotificationModalOpen(true);
        return;
      }
    }
    if (!UserId) {
      setUnitsNotificationMsg("User not found. Please login again.");
      setIsUnitsNotificationModalOpen(true);
      return;
    }
    // console.log(UserId, "Units Notification Value:");
    const value = Number(unitsNotificationValue);
    if (isNaN(value)) {
      setUnitsNotificationMsg("Please enter a valid number.");
      setIsUnitsNotificationModalOpen(true);
      return;
    }

    try {
      const res = await axios.post(
        `https://emsbackend-eight.vercel.app/api/user/unitsNotification`,
        {
          UserId,
          unitsNotification: value,
        }
      );
      console.log("Units notification response:", res);

      setUnitsNotificationMsg(
        res.data.message || "Units notification updated successfully."
      );
    } catch (err) {
      console.log("Error updating units notification:", err);

      setUnitsNotificationMsg(
        err.response?.data?.message || "Failed to update units notification."
      );
    }
    setIsUnitsNotificationModalOpen(true);
  };

  // 1. Calculate today's units consumed from Firebase data
  const unitsConsumedToday = React.useMemo(() => {
    if (!firebaseEnergyData || Object.keys(firebaseEnergyData).length === 0)
      return 0;
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    return Object.values(firebaseEnergyData)
      .filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= todayStart;
      })
      .reduce((sum, entry) => sum + (parseFloat(entry.energy_used) || 0), 0);
  }, [firebaseEnergyData]);

  // 2. Calculate daily limit and percentage
  const dailyLimit =
    currentUnitsNotification > 0 ? currentUnitsNotification / 30 : 1;
  const consumedPercent =
    dailyLimit > 0 ? Math.min((unitsConsumedToday / dailyLimit) * 100, 100) : 0;

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        setUser(parsedUser);
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
      <Header onExportPdf={handleExportPdf} />
      <Sidebar active={sidebarTab} setActive={setSidebarTab} />

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
            alert("Please contact support to reactivate your service.");
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
        style={{
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          marginLeft: 250,
          transition: "margin-left 0.2s",
        }}
      >
        <div className="container py-4">
          <div className="header">
            <h1>Good Evening, zaheer ud din babar</h1>
            <span
              className="status"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span
                className={
                  deviceStatus === "Online" ? "online-dot" : "offline-dot"
                }
                style={{ fontSize: "1.5rem" }}
              >
                ●
              </span>
              <span
                style={{
                  fontWeight: 500,
                  color: deviceStatus === "Online" ? "#28a745" : "#dc3545",
                }}
              >
                {deviceStatus === "Online" ? "Active" : "Inactive"}
              </span>
            </span>
          </div>
          {sidebarTab === "dashboard" && (
            <>
              <div className="cards">
                {/* Daily Limit */}
                <div className="card">
                  <h2>Daily Limit</h2>
                  <div className="progress-container">
                    <svg width="250" height="250">
                      <circle
                        cx="125"
                        cy="125"
                        r="110"
                        stroke="#ccc"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="125"
                        cy="125"
                        r="110"
                        stroke="#1f2937"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(consumedPercent / 100) * (2 * Math.PI * 110)
                          } ${2 * Math.PI * 110}`}
                        strokeLinecap="round"
                        transform="rotate(-90 125 125)"
                      />
                    </svg>
                    <div className="progress-text">
                      <div className="percent">
                        {consumedPercent.toFixed(1)}%
                      </div>
                      <div className="desc">
                        consumed of daily limit
                        <br />
                        <span style={{ fontSize: "1rem", color: "#888" }}>
                          {unitsConsumedToday.toFixed(2)} /{" "}
                          {dailyLimit.toFixed(2)} units
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="legend">
                    <div>
                      <span className="dot blue"></span> Units Consumed Today
                    </div>
                    <div>
                      <span className="dot gray"></span> Daily Limit
                    </div>
                  </div>
                </div>
                {/* Energy Consumption */}
                <div className="card" style={{ flex: 3 }}>
                  <div className="energy-card-header">
                    <h2>Energy Consumption</h2>
                    <select
                      className="dropdown"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                    >
                      <option value="24h">Last 24 Hours</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  {isLoadingEnergyData ? (
                    <div className="energy-loader">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">Loading energy data...</p>
                    </div>
                  ) : Object.keys(firebaseEnergyData).length === 0 ? (
                    <div className="energy-loader">
                      <p className="text-muted">
                        No energy data available for the selected timeframe
                      </p>
                      <small className="text-muted">
                        Data will appear here once energy readings are recorded
                      </small>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <Line
                        data={dynamicLineData}
                        options={lineOptions}
                        style={{ width: "100%" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="cards bottom-cards">
                <div className="card small">
                  <h3>Current</h3>
                  <div className="value">
                    {deviceStatus === "Active"
                      ? currentReading.toFixed(2)
                      : "0.00"}{" "}
                    A
                  </div>
                </div>
                <div className="card small">
                  <h3>Voltage</h3>
                  <div className="value">
                    {deviceStatus === "Active"
                      ? voltageReading.toFixed(0)
                      : "0"}{" "}
                    V
                  </div>
                </div>
                <div className="card small">
                  <h3>Power</h3>
                  <div className="value">
                    {deviceStatus === "Active" ? powerReading.toFixed(0) : "0"}{" "}
                    W
                  </div>
                </div>
              </div>
              <div className="cards">
                <div className="card" style={{ flex: 3 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Usage Cost</h3>
                    <select
                      className="dropdown"
                      value={usageCostTimeframe}
                      onChange={(e) => setUsageCostTimeframe(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                        backgroundColor: "white",
                      }}
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>

                  <div style={{ height: "250px" }}>
                    <Bar
                      data={{
                        labels: usageCostData[usageCostTimeframe].labels,
                        datasets: [
                          {
                            data: usageCostData[usageCostTimeframe].data,
                            backgroundColor: "#775F83",
                            label: "Cost (PKR)",
                          },
                        ],
                      }}
                      options={{
                        ...usageCostOptions,
                        plugins: {
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                return `PKR ${context.parsed.y.toFixed(2)}`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div
                  className="card"
                  style={{
                    flex: 1,
                    backgroundColor: "#ffffff",
                    borderRadius: "0px",
                    padding: "24px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "#1a202c",
                      marginBottom: "2px",
                    }}
                  >
                    Unit Consumed
                  </h3>
                  <p
                    style={{
                      margin: "0 0 20px 0",
                      fontSize: "15px",
                      fontWeight: "300",
                      color: "#1a202c",
                    }}
                  >
                    Monthly Goal
                  </p>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: "8px",
                      backgroundColor: "#edf2f7",
                      borderRadius: "4px",
                      marginBottom: "5px",
                      overflow: "hidden",
                      marginTop: "auto",
                    }}
                  >
                    <div
                      style={{
                        width: `${monthlyProgress}%`,
                        height: "100%",
                        backgroundColor: "#775F83",
                        borderRadius: "4px",
                        transition: "width 0.5s",
                      }}
                    ></div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "20px",
                      fontSize: "0.875rem",
                      color: "#718096",
                    }}
                  >
                    <span>0</span>
                    <span>{monthlyGoal} Units</span>
                  </div>

                  {/* Consumption Items */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "auto",
                    }}
                  >
                    {/* This Month */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "5px 16px",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          backgroundColor: "#775F83",
                          borderRadius: "50%",
                          marginRight: "12px",
                          flexShrink: 0,
                        }}
                      ></div>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "1rem",
                            color: "#4a5568",
                          }}
                        >
                          This Month:{" "}
                          <span
                            style={{
                              fontWeight: "600",
                              color: "#1a202c",
                            }}
                          >
                            {monthlyConsumed.toFixed(2)} Units
                          </span>
                        </p>
                      </div>
                    </div>
                    {/* You can keep Yesterday/Last week as before, or make them dynamic if you wish */}
                  </div>
                </div>
              </div>
              <div
                style={{ backgroundColor: "white" }}
                className="mb-3 p-4 rounded"
              >
                <h5 className="mb-3">Detailed Analysis</h5>

                {/* Analysis Tabs */}
                <div className="mb-4">
                  <div className="d-flex">
                    <button
                      className={`btn ${activeAnalysisTab === "consumption"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                        } me-2 rounded-pill px-3`}
                      onClick={() => setActiveAnalysisTab("consumption")}
                    >
                      Consumption
                    </button>
                    <button
                      className={`btn ${activeAnalysisTab === "costs"
                        ? "btn-primary"
                        : "btn-outline-secondary"
                        } me-2 rounded-pill px-3`}
                      onClick={() => setActiveAnalysisTab("costs")}
                    >
                      Costs
                    </button>
                    <button
                      className={`btn ${activeAnalysisTab === "insights"
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
                    {isLoadingEnergyData ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "200px",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">
                          Loading consumption data...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="row">
                          <div className="col-md-4">
                            <div className="p-3 border rounded">
                              <p className="text-muted mb-1">Daily Average</p>
                              <h4 className="mb-0">
                                {calculateConsumptionMetrics.dailyAverage}{" "}
                                <span className="text-muted">kWh</span>
                              </h4>
                              <small className="text-muted">
                                Current month average
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 border rounded">
                              <p className="text-muted mb-1">Peak Usage</p>
                              <h4 className="mb-0">
                                {calculateConsumptionMetrics.peakUsage}{" "}
                                <span className="text-muted">kWh</span>
                              </h4>
                              <small className="text-muted">
                                Peak at {calculateConsumptionMetrics.peakTime}
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 border rounded">
                              <p className="text-muted mb-1">
                                Total Monthly Consumption
                              </p>
                              <h4 className="mb-0">
                                {
                                  calculateConsumptionMetrics.totalMonthlyConsumption
                                }{" "}
                                <span className="text-muted">kWh</span>
                              </h4>
                              <small className="text-muted">
                                Current month usage
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          {calculateConsumptionMetrics.totalMonthlyConsumption >
                            0 ? (
                            <div>
                              <p>
                                Your electricity usage shows a daily average of{" "}
                                {calculateConsumptionMetrics.dailyAverage} kWh
                                with peak consumption of{" "}
                                {calculateConsumptionMetrics.peakUsage} kWh
                                recorded at{" "}
                                {calculateConsumptionMetrics.peakTime}. Consider
                                monitoring usage during peak hours to optimize
                                energy consumption.
                              </p>
                              {calculateConsumptionMetrics.peakUsage >
                                calculateConsumptionMetrics.dailyAverage *
                                2 && (
                                  <div className="alert alert-warning mt-3">
                                    <strong>High Peak Usage Detected:</strong>{" "}
                                    Your peak usage is significantly higher than
                                    your daily average. Consider identifying
                                    high-power devices that may be causing these
                                    spikes.
                                  </div>
                                )}
                            </div>
                          ) : (
                            <div className="alert alert-info">
                              <strong>No consumption data available:</strong>{" "}
                              Start using your electrical devices to see
                              consumption analytics here.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Costs View */}
                {activeAnalysisTab === "costs" && (
                  <div>
                    {isLoadingEnergyData ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "200px",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading cost data...</p>
                      </div>
                    ) : (
                      <>
                        <div className="row">
                          <div className="col-md-4">
                            <div className="p-3 border rounded">
                              <p className="text-muted mb-1">
                                Monthly Estimate
                              </p>
                              <h4 className="mb-0">
                                PKR {calculateCostMetrics.monthlyEstimate}
                              </h4>
                              <small className="text-muted">
                                Based on current usage
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 border rounded">
                              <p className="text-muted mb-1">
                                Daily Average Cost
                              </p>
                              <h4 className="mb-0">
                                PKR {calculateCostMetrics.dailyAverageCost}
                              </h4>
                              <small className="text-muted">
                                Current month average
                              </small>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 border rounded">
                              <p className="text-muted mb-1">Rate</p>
                              <h4 className="mb-0">
                                PKR {calculateCostMetrics.rate}/kWh
                              </h4>
                              <small className="text-muted">Current rate</small>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          {calculateConsumptionMetrics.totalMonthlyConsumption >
                            0 ? (
                            <div>
                              <p>
                                Your current electricity rate is PKR{" "}
                                {calculateCostMetrics.rate}/kWh. Based on your
                                usage patterns with a monthly consumption of{" "}
                                {
                                  calculateConsumptionMetrics.totalMonthlyConsumption
                                }{" "}
                                kWh, your estimated monthly cost is PKR{" "}
                                {calculateCostMetrics.monthlyEstimate}.
                              </p>
                              {calculateCostMetrics.potentialSavings > 0 && (
                                <div className="alert alert-success mt-3">
                                  <strong>Potential Savings:</strong> You could
                                  save approximately PKR{" "}
                                  {calculateCostMetrics.potentialSavings} per
                                  month by optimizing usage during peak hours
                                  and reducing standby power consumption.
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="alert alert-info">
                              <strong>No cost data available:</strong> Cost
                              analysis will appear here once energy consumption
                              data is recorded.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Insights View */}
              </div>
            </>
          )}

          {sidebarTab == "setup" && (
            <div
              className="d-flex justify-content-left align-items-center"
              style={{ minHeight: "80vh" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "18px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  padding: "2.5rem 2.5rem 2rem 2.5rem",
                  minWidth: 360,
                  maxWidth: 380,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Monthly Goal
                </div>
                <div
                  style={{
                    color: "#222",
                    fontSize: "1.05rem",
                    marginBottom: 32,
                  }}
                >
                  Can be set once every 30 days
                </div>
                <MonthlyGoalSetter />
              </div>
            </div>
          )}
        </div>
        {
          sidebarTab === "analysis" && (
            <div className="insights-container">
              {/* <h2>Insights</h2> */}
              <EnergyDashboard />
            </div>
          )
        }
      </div>


    </>
  );
};

// Place this component at the end of the file (before export default)
function MonthlyGoalSetter() {
  const [goal, setGoal] = React.useState(0);
  const [lastSet, setLastSet] = React.useState("Not set");
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Optionally, load the current goal from backend on mount
  React.useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        if (parsedUser.UserId) {
          axios
            .get(
              `https://emsbackend-eight.vercel.app/api/user/getUnitsNotification?UserId=${parsedUser.UserId}`
            )
            .then((res) => {
              console.log("dataaed", res);
              if (res.data.unitsNotification) {
                console.log("dataaed", res.data.unitsNotification);
                setGoal(Number(res.data.unitsNotification));
              }
            });
        }
      } catch { }
    }
  }, []);

  const handleSetGoal = async () => {
    setLoading(true);
    setStatus("");
    const userString = localStorage.getItem("user");
    let UserId = null;
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        UserId = parsedUser.UserId;
      } catch {
        setStatus("User not found. Please login again.");
        setLoading(false);
        return;
      }
    }
    if (!UserId) {
      setStatus("User not found. Please login again.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "https://emsbackend-eight.vercel.app/api/user/unitsNotification",
        {
          UserId,
          unitsNotification: goal,
        }
      );
      setLastSet(new Date().toLocaleString());
      setStatus(res.data.message || "Monthly goal updated!");
    } catch (err) {
      setStatus(
        err.response?.data?.message || "Failed to update monthly goal."
      );
    }
    setLoading(false);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <button
          aria-label="Increase"
          onClick={() => setGoal((g) => Math.min(g + 1, 999))}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "2.5rem",
            lineHeight: 1,
            color: "#111",
            display: "block",
            margin: "0 auto",
          }}
        >
          ▲
        </button>
        <div
          style={{
            fontSize: "4rem",
            fontWeight: 500,
            letterSpacing: 2,
            margin: "0.2em 0",
          }}
        >
          {goal}
        </div>
        <button
          aria-label="Decrease"
          onClick={() => setGoal((g) => Math.max(g - 1, 0))}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "2.5rem",
            lineHeight: 1,
            color: "#111",
            display: "block",
            margin: "0 auto",
          }}
        >
          ▼
        </button>
      </div>
      <div
        className="d-flex justify-content-between align-items-center"
        style={{ marginTop: 24 }}
      >
        <span style={{ fontSize: "1.1rem" }}>Last set:</span>
        <button
          onClick={handleSetGoal}
          disabled={loading}
          style={{
            background: "#2d3450",
            color: "#fff",
            border: "none",
            borderRadius: "2em",
            padding: "0.5em 2em",
            fontSize: "1.2rem",
            fontWeight: 500,
            marginLeft: 12,
            transition: "background 0.2s",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Saving..." : "Set"}
        </button>
      </div>
      <div
        style={{
          textAlign: "left",
          marginTop: 8,
          color: status.includes("success") ? "#28a745" : "#222",
          fontSize: "1.05rem",
        }}
      >
        {lastSet}
        <div>{status}</div>
      </div>
    </>
  );
}

const EnergyDashboard = () => {
  // --- Loading state for predictive score ---
  const [loadingScore, setLoadingScore] = useState(false);
  // --- State for Predictive Energy Saving Score ---
  const [predictedScore, setPredictedScore] = useState(null);
  // --- State Hooks ---
  const [predictedData, setPredictedData] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [timeFrame, setTimeFrame] = useState("This Week");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [energyData, setEnergyData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  // --- Functions ---
  const fetchPredictedData = async () => {
    setPredicting(true);
    try {
      const response = await axios.post('http://localhost:2000/api/predict', {
        contextData: energyData,
        timeFrame: timeFrame
      });
      setPredictedData(response.data);
      console.log("Predicted Data: ", response.data);
    } catch (error) {
      console.error("Error fetching predicted data:", error);
    } finally {
      setPredicting(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      // Send the energy data to the new analytics API endpoint
      const response = await axios.post('http://localhost:2000/api/analytics', {
        contextData: energyData
      });
      setAnalyticsData(response.data);
      console.log("Analytics Data: ", response.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchPredictedScore = async () => {
    setLoadingScore(true);
    try {
      const response = await axios.post('http://localhost:2000/api/predict-score', {
        contextData: energyData
      });
      setPredictedScore(response.data);
      console.log("Predicted Score Data: ", response.data);
    } catch (error) {
      console.error("Error fetching predicted score:", error);
    } finally {
      setLoadingScore(false);
    }
  };


  const handleSendMessage = async () => {
    if (!input.trim() || !energyData) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    let formattedData = "No energy data found for this user.";
    if (energyData && Object.keys(energyData).length > 0) {
      formattedData = Object.keys(energyData).map(key => {
        const entry = energyData[key];
        return `Timestamp: ${entry.timestamp}, Energy Used: ${entry.energy_used} kWh`;
      }).join('; ');
    }

    try {
      const response = await axios.post('http://localhost:2000/api/chat', {
        message: input,
        contextData: formattedData
      });

      const aiMessage = { text: response.data.message, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { text: 'Sorry, something went wrong. Please try again.', sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Debounce hook to prevent excessive API calls
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
  
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
  
    return debouncedValue;
  };
  
  // Debounced version of energyData
  const debouncedEnergyData = useDebounce(energyData, 1500); // 1.5 seconds delay

  // --- UseEffect for Data Fetching and API Calls ---
  useEffect(() => {
    const userId = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).UserId : null;
    if (!userId) {
      console.error("User ID not found in localStorage.");
      return;
    }
    
    // Listen for real-time changes to the energy data in Firebase
    const energyRef = ref(database, `${userId}/energy`);
    const unsubscribe = onValue(energyRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Real-time energy data:", data);
      setEnergyData(data || {});
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // This useEffect will trigger the API calls only when debouncedEnergyData changes
  useEffect(() => {
    if (debouncedEnergyData) {
      fetchPredictedData();
      fetchAnalyticsData();
      fetchPredictedScore();
    }
  }, [debouncedEnergyData, timeFrame]);

  // --- Memoized Chart Data and Options ---
  // Only plot the predicted data, not the Firebase/historical data
  const chartData = useMemo(() => {
    if (predictedData && Array.isArray(predictedData.labels) && Array.isArray(predictedData.data)) {
      return {
        labels: predictedData.labels,
        datasets: [
          {
            label: 'Predicted Usage',
            data: predictedData.data,
            borderColor: '#6c757d',
            backgroundColor: 'rgba(108, 117, 125, 0.1)',
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
          },
        ],
      };
    }
    return { labels: [], datasets: [] };
  }, [predictedData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, ticks: { display: false } },
    },
  };
  
  // Helper function to get Font Awesome icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return faCheckCircle;
      case 'warning':
        return faExclamationCircle;
      case 'danger':
        return faExclamationCircle;
      default:
        return faCircle;
    }
  };

  const scorePoints = useMemo(() => [
    { key: 'peakHourUsage', text: 'Peak Hour Usage' },
    { key: 'suddenHighUse', text: 'Sudden High Use' },
    { key: 'nightTimeUsage', text: 'Night-time Usage' },
    { key: 'weeklyChange', text: 'Weekly Change' },
    { key: 'dailyUsageSpread', text: 'Daily Usage Spread' },
  ], []);

  const calculateScoreCount = () => {
    if (!predictedScore) return 0;
    return Object.values(predictedScore).filter(value => value === true).length;
  };
  
  const scoreCount = calculateScoreCount();

  return (
    <Container fluid className="p-4 bg-light">
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100 p-3 shadow-sm border-0">
            <h5 className="mb-3 text-muted">Energy Saving Score</h5>
            <div className="text-center">
              <img width={"50%"} src={bulb_image} alt="Energy Saving Bulb" />
              <h1 className="display-4 fw-bold">{loadingScore ? '...' : `${scoreCount}/5`}</h1>
            </div>
            <hr />
            {loadingScore ? (
              <div className="text-center">
                <Spinner animation="border" role="status" size="sm">
                  <span className="visually-hidden">Predicting score...</span>
                </Spinner>
              </div>
            ) : (
              <ul className="list-unstyled">
                {scorePoints.map(point => (
                  <li key={point.key} className="mb-2">
                    <FontAwesomeIcon
                      icon={predictedScore && predictedScore[point.key] ? faCheckCircle : faExclamationCircle}
                      className={predictedScore && predictedScore[point.key] ? "text-success me-2" : "text-danger me-2"}
                    />
                    {point.text}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Col>

        <Col md={8}>
          <Card className="h-100 p-3 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-muted">Predicted Pattern</h5>
              <div className="d-flex">
                <Form.Select size="sm" className="me-2">
                  <option>Energy</option>
                </Form.Select>
                <Form.Select size="sm" onChange={(e) => setTimeFrame(e.target.value)}>
                  <option value="This Week">This Week</option>
                  <option value="Next Week">Next Week</option>
                </Form.Select>
              </div>
            </div>
            <div className="p-3">
              {predicting ? (
                <div className="text-center">
                  <p>Generating prediction...</p>
                </div>
              ) : (
                <Line data={chartData} options={chartOptions} />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="h-100 p-3 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-muted">Chat with AI</h5>
              <FontAwesomeIcon icon={faExpand} className="text-muted" role="button" />
            </div>
            <div style={{ height: '200px', border: '1px solid #dee2e6', borderRadius: '0.25rem', padding: '10px', overflowY: 'auto' }}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded ${msg.sender === 'user' ? 'bg-primary text-white ms-auto' : 'bg-light me-auto'}`}
                  style={{ maxWidth: '75%' }}
                >
                  {msg.text}
                </div>
              ))}
              {loading && <div className="text-center">AI is thinking...</div>}
            </div>
            <InputGroup className="mt-3">
              <Form.Control
                placeholder="Chat with AI here...."
                aria-label="Chat with AI here...."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                style={{ backgroundColor: '#775F83', borderColor: '#775F83' }}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </Button>
            </InputGroup>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="h-100 p-3 shadow-sm border-0">
            <h5 className="mb-3 text-muted">AI Driven Analytics</h5>
            <div className="h-100 d-flex flex-column justify-content-center">
              <p className="fw-bold">Based on current data:</p>
              {loadingAnalytics ? (
                <div className="text-center">
                  <Spinner animation="border" role="status" size="sm">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <ul className="list-unstyled">
                  {analyticsData.length > 0 ? (
                    analyticsData.map((insight, index) => (
                      <li key={index} className="mb-2">
                        <Badge bg={insight.status} className="me-2 rounded-circle">&nbsp;</Badge>
                        {insight.text}
                      </li>
                    ))
                  ) : (
                    <p className="text-muted">No insights available yet.</p>
                  )}
                </ul>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};


// export default EnergyDashboard;
export default EpsilonEMS;
