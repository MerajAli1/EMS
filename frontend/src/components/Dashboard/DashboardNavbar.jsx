import React, { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

const DashboardNavbar = ({ onAddUser }) => {
  const navigate = useNavigate();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("commercial");
  const [pricingData, setPricingData] = useState({
    commercial: {},
    residential: {},
  });

  const openPricingModal = async () => {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const tabs = ["commercial", "residential"];
    const wattMap = {
      ThreeKW: "3KW",
      FiveKW: "5KW",
      TenKW: "10KW",
    };
    const unitMap = ["unit1", "unit2", "unit3", "unit4"];
    const newPricingData = {};

    try {
      for (const tab of tabs) {
        const response = await fetch(
          "https://emsbackend-eight.vercel.app/api/pricing/watch",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Type: capitalize(tab) }),
          }
        );

        const result = await response.json();
        if (!response.ok) {
          alert(`Failed to fetch ${tab} pricing: ${result.message}`);
          continue;
        }

        const watt = result.Watt;
        const pricing = {};

        Object.entries(watt).forEach(([wattKey, unitObj]) => {
          const level = wattMap[wattKey];
          unitMap.forEach((unitKey, index) => {
            const val = unitObj[unitKey];
            const dataKey = `${tab}-${level}-${index}`;
            pricing[dataKey] = val || 0;
          });
        });

        newPricingData[tab] = pricing;
      }

      setPricingData(newPricingData);
      setIsPricingModalOpen(true);
    } catch (error) {
      console.error("Error loading pricing:", error);
      alert("Error fetching pricing data");
    }
  };

  const closePricingModal = () => setIsPricingModalOpen(false);

  const handlePricingChange = (type, level, index, value) => {
    const key = `${type}-${level}-${index}`;
    setPricingData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const wattMap = {
      "3KW": "ThreeKW",
      "5KW": "FiveKW",
      "10KW": "TenKW",
    };
    const unitMap = ["unit1", "unit2", "unit3", "unit4"];
    const currentData = pricingData[activeTab];
    const wattData = {
      ThreeKW: {},
      FiveKW: {},
      TenKW: {},
    };

    Object.entries(currentData).forEach(([key, value]) => {
      const [, level, index] = key.split("-");
      const wattKey = wattMap[level];
      const unitKey = unitMap[parseInt(index)];
      if (wattKey && unitKey) {
        wattData[wattKey][unitKey] = Number(value);
      }
    });

    const payload = {
      Type: capitalize(activeTab),
      Watt: wattData,
    };

    try {
      const response = await fetch("https://emsbackend-eight.vercel.app/api/pricing/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Pricing data submitted successfully!");
        closePricingModal();
      } else {
        alert(`Failed to update: ${result.message}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong!");
    }
  };

  const renderPricingSection = (type) => {
    const powerLevels = ["3KW", "5KW", "10KW"];
    const unitLabels = ["1-200 units", "200+", "300+", "400+"];
    const data = pricingData[type] || {};

    return powerLevels.map((level) => (
      <div key={`${type}-${level}`} style={{ marginBottom: "2rem" }}>
        <h3>{`${type.charAt(0).toUpperCase() + type.slice(1)} (${level})`}</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1rem",
          }}
        >
          {unitLabels.map((label, index) => (
            <div key={`${type}-${level}-${index}`}>
              <p>{label}</p>
              <input
                type="number"
                value={data[`${type}-${level}-${index}`] || ""}
                onChange={(e) =>
                  handlePricingChange(type, level, index, e.target.value)
                }
                style={{
                  background: "#f0f0f0",
                  padding: "0.8rem",
                  borderRadius: "8px",
                  width: "100%",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 className="display-5">Epsilon EMS</h1>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <i
          className="bi bi-cash-coin"
          style={{ fontSize: "1.5rem", cursor: "pointer" }}
          onClick={openPricingModal}
        ></i>
        <i
          className="bi bi-file-earmark-arrow-up"
          style={{ fontSize: "1.5rem", cursor: "pointer" }}
          onClick={() => navigate("/adminLogin")}
        ></i>
        <button
          onClick={onAddUser}
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            padding: "0.5rem 1rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Add User
        </button>
      </div>

      <Modal
        isOpen={isPricingModalOpen}
        onRequestClose={closePricingModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "2rem",
            borderRadius: "10px",
          },
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
        }}
      >
        <div>
          <h2 style={{ marginBottom: "2rem" }}>Unit Pricing</h2>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
            {["commercial", "residential"].map((tab, idx) => (
              <div
                key={tab}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
                onClick={() => setActiveTab(tab)}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      activeTab === tab ? "#007bff" : "#000"
                    }`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: activeTab === tab ? "#007bff" : "#000",
                    fontWeight: activeTab === tab ? "bold" : "normal",
                  }}
                >
                  {idx + 1}
                </div>
                <span
                  style={{
                    color: activeTab === tab ? "#007bff" : "#000",
                    fontWeight: activeTab === tab ? "bold" : "normal",
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </span>
              </div>
            ))}
          </div>

          {renderPricingSection(activeTab)}

          <button
            onClick={handleSubmit}
            style={{
              marginTop: "2rem",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              cursor: "pointer",
              float: "right",
            }}
          >
            Submit
          </button>
        </div>
      </Modal>
    </nav>
  );
};

export default DashboardNavbar;
