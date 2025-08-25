import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  // Check if both token and user exist
  if (!token || !user) {
    // Clear any invalid data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  // Validate that user data is valid JSON
  try {
    JSON.parse(user);
  } catch (error) {
    console.error("Invalid user data in localStorage:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
