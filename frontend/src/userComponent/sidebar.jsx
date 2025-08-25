import React from "react";

const sidebarStyle = {
  width: 250, // Changed from 220 to 250
  background: "#2d3450",
  color: "#fff",
  minHeight: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 2000000000,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: 0,
  boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
};

const logoStyle = {
  width: "100%",
  padding: "24px 0 8px 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  borderBottom: "1px solid #3c4260",
  marginBottom: 24,
};

const logoIconStyle = {
  fontSize: "2.4rem",
  fontWeight: "bold",
  letterSpacing: "2px",
  marginBottom: 0,
  fontFamily: "monospace",
};

const logoTextStyle = {
  fontWeight: 700,
  fontSize: "1rem",
  letterSpacing: "1px",
  marginBottom: 2,
};

const logoSubTextStyle = {
  fontSize: "0.7rem",
  color: "#bfc6e0",
  fontWeight: 400,
  marginBottom: 0,
};

const navStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  padding: "0 0 0 18px",
};

const navBtnStyle = (active) => ({
  background: "none",
  border: "none",
  color: "#fff",
  textAlign: "left",
  padding: "6px 0",
  fontWeight: 500,
  fontSize: "0.98rem",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  cursor: "pointer",
  outline: "none",
  transition: "color 0.2s",
  textDecoration: active ? "underline" : "none",
  opacity: active ? 1 : 0.85,
});

const iconStyle = {
  fontSize: "1.7rem",
  minWidth: "2.1rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const Sidebar = ({ active, setActive }) => (
  <div style={sidebarStyle}>
    <div style={logoStyle}>
      <span style={logoIconStyle}>E</span>
      <span style={logoTextStyle}>EPSILON SYSTEMS</span>
      <span style={logoSubTextStyle}>Sense. Analyze. Automate. Monitor</span>
    </div>
    <nav style={navStyle}>
      <button
        style={navBtnStyle(active === "dashboard")}
        onClick={() => setActive("dashboard")}
      >
        <span style={iconStyle}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="2" fill="#fff" opacity={active === "dashboard" ? 1 : 0.7}/>
            <rect x="14" y="3" width="7" height="7" rx="2" fill="#fff" opacity={active === "dashboard" ? 1 : 0.7}/>
            <rect x="14" y="14" width="7" height="7" rx="2" fill="#fff" opacity={active === "dashboard" ? 1 : 0.7}/>
            <rect x="3" y="14" width="7" height="7" rx="2" fill="#fff" opacity={active === "dashboard" ? 1 : 0.7}/>
          </svg>
        </span>
        Dashboard
      </button>
      <button
        style={navBtnStyle(active === "analysis")}
        onClick={() => setActive("analysis")}
      >
        <span style={iconStyle}>
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="10" width="3" height="11" rx="1.5" fill="#fff" opacity={active === "analysis" ? 1 : 0.7}/>
            <rect x="8.5" y="6" width="3" height="15" rx="1.5" fill="#fff" opacity={active === "analysis" ? 1 : 0.7}/>
            <rect x="14" y="2" width="3" height="19" rx="1.5" fill="#fff" opacity={active === "analysis" ? 1 : 0.7}/>
          </svg>
        </span>
        <span style={{ textDecoration: "underline" }}>AI Analysis</span>
      </button>
      <button
        style={navBtnStyle(active === "setup")}
        onClick={() => setActive("setup")}
      >
        <span style={iconStyle}>
          {/* Fixed wrench & screwdriver icon */}
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <g>
              <path d="M20.7 19.3l-2.02-2.02a1 1 0 0 0-1.41 0l-1.34 1.34a1 1 0 0 1-1.41-1.41l1.34-1.34a1 1 0 0 0 0-1.41l-2.02-2.02a1 1 0 0 1 0-1.41l1.34-1.34a1 1 0 0 0-1.41-1.41l-1.34 1.34a1 1 0 0 1-1.41 0l-2.02-2.02a1 1 0 0 1 0-1.41l1.34-1.34a1 1 0 0 0-1.41-1.41l-1.34 1.34a1 1 0 0 1-1.41 0L3.3 3.3a1 1 0 0 1 1.41-1.41l2.02 2.02a1 1 0 0 0 1.41 0l1.34-1.34a1 1 0 0 1 1.41 1.41l-1.34 1.34a1 1 0 0 0 0 1.41l2.02 2.02a1 1 0 0 1 0 1.41l-1.34 1.34a1 1 0 0 0 1.41 1.41l1.34-1.34a1 1 0 0 1 1.41 0l2.02 2.02a1 1 0 0 1 0 1.41l-1.34 1.34a1 1 0 0 0 1.41 1.41l1.34-1.34a1 1 0 0 1 1.41 0l2.02 2.02a1 1 0 0 1-1.41 1.41z" fill="#fff" opacity={active === "setup" ? 1 : 0.7}/>
            </g>
          </svg>
        </span>
        Setup
      </button>
    </nav>
  </div>
);

export default Sidebar;