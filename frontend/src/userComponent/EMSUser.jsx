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
import { database } from "../../firebaseConfig/firebase";

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
  Tooltip
);
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    .filter(entry => entry.timestamp && entry.energy_used !== undefined)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  if (energyEntries.length === 0) {
    return { labels: [], data: [] };
  }

  const now = new Date();
  let filteredData = [];

  if (timeframe === "24h") {
    // Get data from last 24 hours
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    filteredData = energyEntries.filter(entry => 
      new Date(entry.timestamp) >= last24Hours
    );
    
    // Group by hour
    const hourlyData = {};
    filteredData.forEach(entry => {
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
    filteredData = energyEntries.filter(entry => 
      new Date(entry.timestamp) >= lastWeek
    );

    // Group by day
    const dailyData = {};
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    filteredData.forEach(entry => {
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
    filteredData = energyEntries.filter(entry => 
      new Date(entry.timestamp) >= lastMonth
    );

    // Group by week
    const weeklyData = {};
    filteredData.forEach(entry => {
      const date = new Date(entry.timestamp);
      const weekStart = new Date(date.getTime() - date.getDay() * 24 * 60 * 60 * 1000);
      const weekKey = `Week ${Math.ceil((weekStart.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = [];
      }
      weeklyData[weekKey].push(parseFloat(entry.energy_used) || 0);
    });

    const labels = [];
    const data = [];
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const currentWeek = Math.ceil((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
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
    for (let hour = 12; hour <= 30; hour++) { // 30 = 6 AM next day (24 + 6)
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

const EpsilonEMS = () => {
  const [activeView, setActiveView] = useState("usage");
  const [timeframe, setTimeframe] = useState("24h");
  const [activeAnalysisTab, setActiveAnalysisTab] = useState("consumption");
  const [isServiceInactiveModalOpen, setIsServiceInactiveModalOpen] =
    useState(false);
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
        peakDate: "N/A"
      };
    }

    const energyEntries = Object.values(firebaseEnergyData)
      .filter(entry => entry.timestamp && entry.energy_used !== undefined)
      .map(entry => ({
        ...entry,
        energy_used: parseFloat(entry.energy_used) || 0,
        timestamp: new Date(entry.timestamp)
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (energyEntries.length === 0) {
      return {
        dailyAverage: 0,
        peakUsage: 0,
        totalMonthlyConsumption: 0,
        peakTime: "N/A",
        peakDate: "N/A"
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter data for current month
    const currentMonthData = energyEntries.filter(entry => 
      entry.timestamp.getMonth() === currentMonth && 
      entry.timestamp.getFullYear() === currentYear
    );

    // Calculate total monthly consumption
    const totalMonthlyConsumption = currentMonthData.reduce((sum, entry) => sum + entry.energy_used, 0);

    // Calculate daily average (based on days passed in current month)
    const currentDay = now.getDate();
    const dailyAverage = currentDay > 0 ? totalMonthlyConsumption / currentDay : 0;

    // Find peak usage and time
    const peakEntry = energyEntries.reduce((peak, entry) => {
      return entry.energy_used > peak.energy_used ? entry : peak;
    }, energyEntries[0] || { energy_used: 0, timestamp: now });

    const peakTime = peakEntry.timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const peakDate = peakEntry.timestamp.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const peakDateTime = `${peakTime} on ${peakDate}`;

    return {
      dailyAverage: parseFloat(dailyAverage.toFixed(3)),
      peakUsage: parseFloat(peakEntry.energy_used.toFixed(3)),
      totalMonthlyConsumption: parseFloat(totalMonthlyConsumption.toFixed(3)),
      peakTime: peakDateTime,
      peakDate: peakDate
    };
  }, [firebaseEnergyData]);

  // Calculate cost metrics from consumption data
  const calculateCostMetrics = useMemo(() => {
    const rate = 44; // PKR per kWh
    const { dailyAverage, totalMonthlyConsumption } = calculateConsumptionMetrics;
    
    const monthlyEstimate = totalMonthlyConsumption * rate;
    const dailyAverageCost = dailyAverage * rate;
    
    // Estimate potential savings (assuming 10% reduction during peak hours)
    const potentialSavings = monthlyEstimate * 0.1;

    return {
      monthlyEstimate: parseFloat(monthlyEstimate.toFixed(2)),
      dailyAverageCost: parseFloat(dailyAverageCost.toFixed(2)),
      potentialSavings: parseFloat(potentialSavings.toFixed(2)),
      rate: rate
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
    // Get userId from localStorage
    const userString = localStorage.getItem("user");
    let userId = "user0001";
    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        if (parsedUser.UserId) {
          userId = parsedUser.UserId;
        }
      } catch (error) {
        console.error(
          "Failed to parse user data from localStorage for userId:",
          error
        );
      }
    }
    const readingsRef = ref(database, `${userId}/essentials`);

    const unsubscribe = onValue(readingsRef, (snapshot) => {
      const essentialsData = snapshot.val(); // Get the entire essentials object
      console.log("essential data", essentialsData);
      if (essentialsData) {
        // Directly access the properties from essentialsData
        setCurrentReading(essentialsData.current || 0);
        setVoltageReading(essentialsData.voltage || 0);

        setPowerReading(essentialsData.power || 0);
        setPowerFactorReading(essentialsData.power_factor || 0); // Add this line
        // This is a simplified calculation - you might want to track this differently
        const monthlyUsage = ((essentialsData.power || 0) * 24 * 30) / 1000; // kW * hours * days
        setUnitsConsumedThisMonth(parseFloat(monthlyUsage.toFixed(2)));
      } else {
        console.log("No essentials data found for this user.");
      }
    });
    return () => unsubscribe();
  }, []);

  // Use useMemo to generate data (labels, consumption, cost) based on Firebase data and timeframe
  const { labels, initialConsumptionData, initialCostData } = useMemo(() => {
    console.log("Processing data for timeframe:", timeframe);
    console.log("Firebase energy data:", firebaseEnergyData);
    
    if (isLoadingEnergyData || Object.keys(firebaseEnergyData).length === 0) {
      // Return fallback data while loading or if no data available
      const fallbackLabels = timeframe === "24h" 
        ? Array.from({length: 24}, (_, i) => `${i}:00`)
        : timeframe === "week"
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : ["Week 1", "Week 2", "Week 3", "Week 4"];
      
      const fallbackData = Array(fallbackLabels.length).fill(0);
      const fallbackCostData = fallbackData.map(val => val * 44); // PKR 44 per kWh
      
      return {
        labels: fallbackLabels,
        initialConsumptionData: fallbackData,
        initialCostData: fallbackCostData,
      };
    }

    // Process real Firebase data
    const { labels: processedLabels, data: processedData } = processFirebaseEnergyData(firebaseEnergyData, timeframe);
    
    // Generate cost data based on consumption
    const costData = processedData.map(consumption => {
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
        backgroundColor: "#7B68EE",
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
        borderColor: "#7B68EE",
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
        max: Math.max(...initialConsumptionData) * 1.2 || (timeframe === "24h" ? 1.0 : timeframe === "week" ? 25 : 500),
      },
      x: {
        ticks: {
          autoSkip: timeframe === "24h" ? false : true,
          maxRotation: timeframe === "24h" ? 45 : 0,
        }
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
            return `${context.dataset.label}: ${context.parsed.y.toFixed(3)} kWh`;
          },
          afterLabel: function(context) {
            if (timeframe === "24h") {
              return `Time: ${context.label}`;
            }
            return '';
          }
        }
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
        max: Math.max(...initialCostData) * 1.2 || (timeframe === "24h" ? 50 : timeframe === "week" ? 1000 : 10000),
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
  const [unitsNotificationValue, setUnitsNotificationValue] = useState("");
  const [unitsNotificationMsg, setUnitsNotificationMsg] = useState("");
  const [isUnitsNotificationModalOpen, setIsUnitsNotificationModalOpen] =
    useState(false);
  const [isUnitsThresholdModalOpen, setIsUnitsThresholdModalOpen] =
    useState(false);
  const [currentUnitsNotification, setCurrentUnitsNotification] = useState(0);

  // Function to fetch and compare units notification
  const fetchAndCompareUnitsNotification = async (UserId) => {
    try {
      const response = await axios.get(
        `https://emsbackend-eight.vercel.app/getUnitsNotification?UserId=${UserId}`
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
        style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}
      >
        <div className="container py-4">
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
                  {voltageReading.toFixed(0)}{" "}
                  <span className="text-muted">V</span>
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

          <div
            style={{ backgroundColor: "white" }}
            className="mb-3 p-5 rounded"
          >
            <h5>Energy Consumption</h5>
            <p className="text-muted">
              Detailed view of your energy consumption in kWh
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
                Usage (kWh)
              </button>
              <button
                className={`btn ${
                  activeView === "cost"
                    ? "btn-outline-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setActiveView("cost")}
              >
                Cost (PKR)
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
            {isLoadingEnergyData ? (
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "300px",
                flexDirection: "column"
              }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading energy data...</p>
              </div>
            ) : Object.keys(firebaseEnergyData).length === 0 ? (
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "300px",
                flexDirection: "column"
              }}>
                <p className="text-muted">No energy data available for the selected timeframe</p>
                <small className="text-muted">Data will appear here once energy readings are recorded</small>
              </div>
            ) : activeView === "usage" ? (
              <div style={{ position: "relative" }}>
                <Line
                  data={dynamicLineData}
                  options={lineOptions}
                  style={{ width: "100%" }}
                />
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <Line
                  data={dynamicCostData}
                  options={costOptions}
                  style={{ width: "100%" }}
                />
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
                {isLoadingEnergyData ? (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    height: "200px",
                    flexDirection: "column"
                  }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading consumption data...</p>
                  </div>
                ) : (
                  <>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Daily Average</p>
                          <h4 className="mb-0">
                            {calculateConsumptionMetrics.dailyAverage} <span className="text-muted">kWh</span>
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
                            {calculateConsumptionMetrics.peakUsage} <span className="text-muted">kWh</span>
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
                            {calculateConsumptionMetrics.totalMonthlyConsumption} <span className="text-muted">kWh</span>
                          </h4>
                          <small className="text-muted">Current month usage</small>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {calculateConsumptionMetrics.totalMonthlyConsumption > 0 ? (
                        <div>
                          <p>
                            Your electricity usage shows a daily average of {calculateConsumptionMetrics.dailyAverage} kWh 
                            with peak consumption of {calculateConsumptionMetrics.peakUsage} kWh recorded at {calculateConsumptionMetrics.peakTime}. 
                            Consider monitoring usage during peak hours to optimize energy consumption.
                          </p>
                          {calculateConsumptionMetrics.peakUsage > calculateConsumptionMetrics.dailyAverage * 2 && (
                            <div className="alert alert-warning mt-3">
                              <strong>High Peak Usage Detected:</strong> Your peak usage is significantly higher than your daily average. 
                              Consider identifying high-power devices that may be causing these spikes.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <strong>No consumption data available:</strong> Start using your electrical devices to see consumption analytics here.
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
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    height: "200px",
                    flexDirection: "column"
                  }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading cost data...</p>
                  </div>
                ) : (
                  <>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Monthly Estimate</p>
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
                          <p className="text-muted mb-1">Daily Average Cost</p>
                          <h4 className="mb-0">
                            PKR {calculateCostMetrics.dailyAverageCost}
                          </h4>
                          <small className="text-muted">Current month average</small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 border rounded">
                          <p className="text-muted mb-1">Rate</p>
                          <h4 className="mb-0">PKR {calculateCostMetrics.rate}/kWh</h4>
                          <small className="text-muted">Current rate</small>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {calculateConsumptionMetrics.totalMonthlyConsumption > 0 ? (
                        <div>
                          <p>
                            Your current electricity rate is PKR {calculateCostMetrics.rate}/kWh. 
                            Based on your usage patterns with a monthly consumption of {calculateConsumptionMetrics.totalMonthlyConsumption} kWh, 
                            your estimated monthly cost is PKR {calculateCostMetrics.monthlyEstimate}.
                          </p>
                          {calculateCostMetrics.potentialSavings > 0 && (
                            <div className="alert alert-success mt-3">
                              <strong>Potential Savings:</strong> You could save approximately PKR {calculateCostMetrics.potentialSavings} per month 
                              by optimizing usage during peak hours and reducing standby power consumption.
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="alert alert-info">
                          <strong>No cost data available:</strong> Cost analysis will appear here once energy consumption data is recorded.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Insights View */}
            {activeAnalysisTab === "insights" && (
              <div>
                {isLoadingEnergyData ? (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "center", 
                    alignItems: "center", 
                    height: "200px",
                    flexDirection: "column"
                  }}>
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading insights...</p>
                  </div>
                ) : calculateConsumptionMetrics.totalMonthlyConsumption > 0 ? (
                  <>
                    <div className="mb-4">
                      <h6>Energy Saving Tips</h6>
                      <p className="text-muted small">
                        Based on your consumption patterns, here are some personalized recommendations:
                      </p>
                      <ul>
                        <li>
                          Your daily average consumption is {calculateConsumptionMetrics.dailyAverage} kWh - 
                          {calculateConsumptionMetrics.dailyAverage > 5 
                            ? " this is above average for a typical household. Consider energy-efficient appliances."
                            : " this is within normal range for a typical household."
                          }
                        </li>
                        <li>
                          Peak usage of {calculateConsumptionMetrics.peakUsage} kWh was recorded at {calculateConsumptionMetrics.peakTime} - 
                          try to identify and manage high-power devices during peak hours
                        </li>
                        <li>
                          Monthly cost estimate is PKR {calculateCostMetrics.monthlyEstimate} - 
                          {calculateCostMetrics.monthlyEstimate > 2000
                            ? " consider implementing energy-saving measures to reduce costs"
                            : " your costs are well managed"
                          }
                        </li>
                        {calculateConsumptionMetrics.peakUsage > calculateConsumptionMetrics.dailyAverage * 1.5 && (
                          <li className="text-warning">
                            <strong>High peak usage detected:</strong> Your peak usage is {(calculateConsumptionMetrics.peakUsage / calculateConsumptionMetrics.dailyAverage).toFixed(1)}x 
                            your daily average. Check for devices that may be causing power spikes.
                          </li>
                        )}
                      </ul>
                    </div>
                    <div className="mb-4">
                      <h6>Consumption Analysis</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded">
                            <h6 className="text-success">Efficiency Score</h6>
                            <div className="progress mb-2">
                              <div 
                                className="progress-bar bg-success" 
                                role="progressbar" 
                                style={{
                                  width: `${Math.max(20, Math.min(100, 100 - (calculateConsumptionMetrics.dailyAverage * 10)))}%`
                                }}
                              ></div>
                            </div>
                            <small className="text-muted">
                              {calculateConsumptionMetrics.dailyAverage < 3 ? "Excellent" : 
                               calculateConsumptionMetrics.dailyAverage < 5 ? "Good" : 
                               calculateConsumptionMetrics.dailyAverage < 8 ? "Average" : "Needs Improvement"}
                            </small>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded">
                            <h6 className="text-info">Cost Efficiency</h6>
                            <div className="progress mb-2">
                              <div 
                                className="progress-bar bg-info" 
                                role="progressbar" 
                                style={{
                                  width: `${Math.max(20, Math.min(100, 100 - (calculateCostMetrics.dailyAverageCost / 5)))}%`
                                }}
                              ></div>
                            </div>
                            <small className="text-muted">
                              PKR {calculateCostMetrics.dailyAverageCost}/day average
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h6>Anomaly Detection</h6>
                      {calculateConsumptionMetrics.peakUsage > calculateConsumptionMetrics.dailyAverage * 3 ? (
                        <div className="alert alert-warning">
                          <strong>Anomaly Detected:</strong> Unusually high peak consumption detected. 
                          This could indicate a malfunctioning device or unusual usage pattern.
                        </div>
                      ) : (
                        <p className="text-muted">
                          No significant anomalies detected in your recent consumption patterns.
                          Your energy usage appears consistent and within normal ranges.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="alert alert-info">
                    <h6>Ready for Insights</h6>
                    <p className="mb-0">
                      Once you start consuming energy, this section will provide personalized insights, 
                      efficiency scores, and recommendations to help you optimize your energy usage and reduce costs.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EpsilonEMS;
