import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Modal from "react-modal";
import Header from "../Dashboard/DashboardNavbar";
import axios from "axios";
import * as XLSX from "xlsx"; // For Excel file manipulation
import { saveAs } from "file-saver"; // For saving the file
import { database } from "../../../firebaseConfig/firebase"; // Import Firebase database
import { ref, set, push } from "firebase/database"; // Import Firebase functions
// Added mobile responsiveness to the Dashboard comp
// onent
export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState("personalDetails");
  const [showRoomField, setShowRoomField] = useState(false);
  const [devices, setDevices] = useState([
    "Light 1",
    "AC 1.5",
    "Fan",
    "Other Item",
  ]);
  const [username, setUsername] = useState("");
  const [cnic, setCnic] = useState("");
  const [address, setAddress] = useState("");
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  // New state variables for password change functionality
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState(null); // Stores the user object whose password is being changed
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isAddApplianceModalOpen, setIsAddApplianceModalOpen] = useState(false);
  const [applianceName, setApplianceName] = useState("");
  const [applianceIcon, setApplianceIcon] = useState("bi bi-pc-display");
  const [selectedService, setSelectedService] = useState("EMS");
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");

  const [automationRooms, setAutomationRooms] = useState([]);
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [currentDevices, setCurrentDevices] = useState([]);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [deviceIcon, setDeviceIcon] = useState("bi bi-lightbulb");

  const [automationHDRooms, setAutomationHDRooms] = useState([]);
  const [currentHDRoomName, setCurrentHDRoomName] = useState("");
  const [currentHDDevices, setCurrentHDDevices] = useState([]);
  const [isAddHDDeviceModalOpen, setIsAddHDDeviceModalOpen] = useState(false);
  const [hdDeviceName, setHDDeviceName] = useState("");
  const [hdDeviceIcon, setHDDeviceIcon] = useState("bi bi-lightbulb");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // Stores the user object to be deleted
  const [emsAutomationRooms, setEmsAutomationRooms] = useState([]);
  const [currentEmsAutomationRoomName, setCurrentEmsAutomationRoomName] =
    useState("");
  const [currentEmsAutomationDevices, setCurrentEmsAutomationDevices] =
    useState([]);
  const [
    isAddEmsAutomationDeviceModalOpen,
    setIsAddEmsAutomationDeviceModalOpen,
  ] = useState(false);
  const [emsAutomationDeviceName, setEmsAutomationDeviceName] = useState("");
  const [emsAutomationDeviceIcon, setEmsAutomationDeviceIcon] =
    useState("bi bi-lightbulb");
  const [emsAutomationMonitoring, setEmsAutomationMonitoring] = useState(false);

  const [emsIRAutomationRooms, setEmsIRAutomationRooms] = useState([]);
  const [currentEmsIRAutomationRoomName, setCurrentEmsIRAutomationRoomName] =
    useState("");
  const [currentEmsIRAutomationDevices, setCurrentEmsIRAutomationDevices] =
    useState([]);
  const [
    isAddEmsIRAutomationDeviceModalOpen,
    setIsAddEmsIRAutomationDeviceModalOpen,
  ] = useState(false);
  const [emsIRAutomationDeviceName, setEmsIRAutomationDeviceName] =
    useState("");
  const [emsIRAutomationDeviceIcon, setEmsIRAutomationDeviceIcon] =
    useState("bi bi-lightbulb");
  const [emsIRAutomationMonitoring, setEmsIRAutomationMonitoring] =
    useState(false);

  const [emsEmsIRAutomationRooms, setEmsEmsIRAutomationRooms] = useState([]);
  const [
    currentEmsEmsIRAutomationRoomName,
    setCurrentEmsEmsIRAutomationRoomName,
  ] = useState("");
  const [
    currentEmsEmsIRAutomationDevices,
    setCurrentEmsEmsIRAutomationDevices,
  ] = useState([]);
  const [
    isAddEmsEmsIRAutomationDeviceModalOpen,
    setIsAddEmsEmsIRAutomationDeviceModalOpen,
  ] = useState(false);
  const [emsEmsIRAutomationDeviceName, setEmsEmsIRAutomationDeviceName] =
    useState("");
  const [emsEmsIRAutomationDeviceIcon, setEmsEmsIRAutomationDeviceIcon] =
    useState("bi bi-lightbulb");
  const [emsEmsIRAutomationMonitoring, setEmsEmsIRAutomationMonitoring] =
    useState(false);

  const [emsEmsIRRooms, setEmsEmsIRRooms] = useState([]);
  const [currentEmsEmsIRRoomName, setCurrentEmsEmsIRRoomName] = useState("");
  // New state variables for status change functionality
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);
  const [userToChangeStatus, setUserToChangeStatus] = useState(null); // Stores the user object whose status is being changed
  const [newServiceStatus, setNewServiceStatus] = useState(false); // Stores the new status (boolean)

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setStep("personalDetails"); // Reset to the first step when closing
  };
  const openAddApplianceModal = () => setIsAddApplianceModalOpen(true);
  const closeAddApplianceModal = () => setIsAddApplianceModalOpen(false);
  const openAddDeviceModal = () => setIsAddDeviceModalOpen(true);
  const closeAddDeviceModal = () => {
    setIsAddDeviceModalOpen(false);
    setDeviceName("");
    setDeviceIcon("bi bi-lightbulb");
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post(
          "https://emsbackend-eight.vercel.app/api/user/getAllUser"
        );
        console.log(response.data);

        setUsers(response.data); // Adjust according to your API response structure
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, [isDeleteModalOpen]);
  // Function to handle the next step in the modal
  const handleNext = () => {
    setStep("servicesDetails");
    setShowRoomField(false); // Ensure Room Name field is hidden initially
  };
  // --- New functions for Delete Modal ---
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (!userToDelete || !userToDelete._id) {
      alert("User information not found. Cannot delete account.");
      closeDeleteModal(); // Close the modal if no user is found
      return;
    }

    try {
      // IMPORTANT: Replace this with your actual delete user API endpoint
      // It's common to send the user's ID for deletion.
      const response = await axios.post(
        "https://emsbackend-eight.vercel.app/api/user/deleteUser", // Verify this is your correct delete endpoint
        { _id: userToDelete._id } // Sending the backend's ID (_id) in the request body
      );

      if (response.status === 200) {
        alert("User deleted successfully!");
        // Filter out the deleted user from the current 'users' state
        setUsers(users.filter((user) => user._id !== userToDelete._id));
      } else {
        alert(
          response.data.message || "Failed to delete user. Please try again."
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while trying to delete the user account.");
    } finally {
      closeDeleteModal(); // Always close the modal after the attempt
    }
  };
  
  // Function to save automation data to Firebase
  const saveAutomationToFirebase = async (userId, automationData, serviceType) => {
    try {
      console.log("Attempting to save to Firebase:", {
        userId,
        serviceType,
        roomCount: automationData ? automationData.length : 0,
        automationData
      });

      // Create a reference to the user's automation data in Firebase
      const userAutomationRef = ref(database, `${userId}`);
      
      // Structure the data as {userId} -> rooms -> {roomName} -> roomName array & devices array
      const firebaseData = {
        rooms: {}
      };
      
      // Process rooms and devices based on the data structure
      if (automationData && automationData.length > 0) {
        automationData.forEach((room, index) => {
          const roomKey = room.roomName || `room_${index}`;
          firebaseData.rooms[roomKey] = {
            roomName: [
              { name: room.roomName }
            ],
            devices: room.devices || [],
            createdAt: new Date().toISOString()
          };
        });
      }
      
      console.log("Firebase data structure:", firebaseData);
      
      // Save to Firebase
      await set(userAutomationRef, firebaseData);
      console.log(`${serviceType} data saved to Firebase successfully for user: ${userId}`);
      
      return true;
    } catch (error) {
      console.error("Error saving automation data to Firebase:", error);
      throw error;
    }
  };
  
  // ...existing code...
  // ...existing code...
  const handleCreateUser = async (e) => {
    e.preventDefault();

    let userRooms = [];
    if (selectedService === "IR") {
      userRooms = rooms;
    } else if (selectedService === "EMS (IR)") {
      userRooms = rooms;
    } else if (selectedService === "Automation") {
      userRooms = automationRooms;
    } else if (selectedService === "Automation(HD)") {
      userRooms = automationHDRooms;
    } else if (selectedService === "EMS+Automation") {
      userRooms = emsAutomationRooms;
    } else if (selectedService === "EMS(IR) + Automation") {
      userRooms = emsIRAutomationRooms;
    } else if (selectedService === "EMS + EMS(IR) + Automation") {
      userRooms = emsEmsIRAutomationRooms;
    } else if (selectedService === "EMS + EMS(IR)") {
      userRooms = emsEmsIRRooms;
    }

    if ((userRooms && userRooms.length > 0) || selectedService == "EMS") {
      const Username = username;
      const CNIC = cnic;
      const Address = address;
      const UserId = userId;
      const Phone = phone;
      const PropertyType = document.querySelector("#userTypeSelect").value; // Or use state if you add it

      try {
        const response = await axios.post(
          "https://emsbackend-eight.vercel.app/api/user/createUser",
          {
            Username,
            CNIC,
            Address,
            UserId,
            Phone,
            Password: UserId,
            Service: selectedService,
            Room: userRooms,
            ServiceStatus: true,
            PropertyType,
          }
        );

        if (response.status === 201) {
          // Save automation data to Firebase if service includes automation
          if (selectedService.includes("Automation")) {
            try {
              await saveAutomationToFirebase(UserId, userRooms, selectedService);
              console.log("Automation data synced to Firebase");
            } catch (firebaseError) {
              console.error("Failed to save automation data to Firebase:", firebaseError);
              // Don't show error to user as main user creation was successful
            }
          }
          
          alert("User created successfully!");
          setIsModalOpen(false);
          setStep("personalDetails");
          
          // Reset all room states after successful creation
          setRooms([]);
          setAutomationRooms([]);
          setAutomationHDRooms([]);
          setEmsAutomationRooms([]);
          setEmsIRAutomationRooms([]);
          setEmsEmsIRAutomationRooms([]);
          setEmsEmsIRRooms([]);
          setCurrentRoomName("");
          setCurrentDevices([]);
          setUsername("");
          setCnic("");
          setAddress("");
          setUserId("");
          setPhone("");
        } else {
          alert(response.data.message || "Failed to create user");
        }
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert(error.response.data.message);
        } else {
          alert("Error creating user");
        }
        console.error(error);
      }
    } else {
      setShowRoomField(true);
      alert("Please add at least one room/device before creating user.");
    }
  };
  const handleAddRoom = () => {
    // Show device buttons when Add Room is clicked
    setDevices(["Light 1", "AC 1.5", "Fan", "Other Item"]);
  };

  const handleAddRoomEMSIR = () => {
    if (roomName.trim() !== "") {
      setRooms([...rooms, { roomName: roomName }]);
      setRoomName("");
    }
  };

  const handleAddDevice = () => {
    if (deviceName.trim() !== "") {
      setCurrentDevices([
        ...currentDevices,
        { name: deviceName, icon: deviceIcon },
      ]);
      setDeviceName("");
      setDeviceIcon("bi bi-lightbulb");
      setIsAddDeviceModalOpen(false);
    }
  };

  const handleAddAutomationRoom = () => {
    if (currentRoomName.trim() !== "" && currentDevices.length > 0) {
      setAutomationRooms([
        ...automationRooms,
        { roomName: currentRoomName, devices: currentDevices },
      ]);
      setCurrentRoomName("");
      setCurrentDevices([]);
    }
  };
  console.log("Automation Rooms:", automationRooms);
  console.log("EMS(IR) Rooms:", rooms);

  // Automation(HD) handlers
  const openAddHDDeviceModal = () => setIsAddHDDeviceModalOpen(true);
  const closeAddHDDeviceModal = () => {
    setIsAddHDDeviceModalOpen(false);
    setHDDeviceName("");
    setHDDeviceIcon("bi bi-lightbulb");
  };
  const handleAddHDDevice = () => {
    if (hdDeviceName.trim() !== "") {
      setCurrentHDDevices([
        ...currentHDDevices,
        { name: hdDeviceName, icon: hdDeviceIcon },
      ]);
      setHDDeviceName("");
      setHDDeviceIcon("bi bi-lightbulb");
      setIsAddHDDeviceModalOpen(false);
    }
  };
  const handleAddAutomationHDRoom = () => {
    if (currentHDRoomName.trim() !== "" && currentHDDevices.length > 0) {
      setAutomationHDRooms([
        ...automationHDRooms,
        { roomName: currentHDRoomName, devices: currentHDDevices },
      ]);
      setCurrentHDRoomName("");
      setCurrentHDDevices([]);
    }
  };

  // EMS+Automation handlers
  const openAddEmsAutomationDeviceModal = () =>
    setIsAddEmsAutomationDeviceModalOpen(true);
  const closeAddEmsAutomationDeviceModal = () => {
    setIsAddEmsAutomationDeviceModalOpen(false);
    setEmsAutomationDeviceName("");
    setEmsAutomationDeviceIcon("bi bi-lightbulb");
  };
  const handleAddEmsAutomationDevice = () => {
    if (emsAutomationDeviceName.trim() !== "") {
      setCurrentEmsAutomationDevices([
        ...currentEmsAutomationDevices,
        { name: emsAutomationDeviceName, icon: emsAutomationDeviceIcon },
      ]);
      setEmsAutomationDeviceName("");
      setEmsAutomationDeviceIcon("bi bi-lightbulb");
      setIsAddEmsAutomationDeviceModalOpen(false);
    }
  };
  const handleAddEmsAutomationRoom = () => {
    if (
      currentEmsAutomationRoomName.trim() !== "" &&
      currentEmsAutomationDevices.length > 0
    ) {
      setEmsAutomationRooms([
        ...emsAutomationRooms,
        {
          roomName: currentEmsAutomationRoomName,
          devices: currentEmsAutomationDevices,
          monitoring: emsAutomationMonitoring,
        },
      ]);
      setCurrentEmsAutomationRoomName("");
      setCurrentEmsAutomationDevices([]);
      setEmsAutomationMonitoring(false);
    }
  };

  // EMS(IR)+Automation handlers
  const openAddEmsIRAutomationDeviceModal = () =>
    setIsAddEmsIRAutomationDeviceModalOpen(true);
  const closeAddEmsIRAutomationDeviceModal = () => {
    setIsAddEmsIRAutomationDeviceModalOpen(false);
    setEmsIRAutomationDeviceName("");
    setEmsIRAutomationDeviceIcon("bi bi-lightbulb");
  };
  const handleAddEmsIRAutomationDevice = () => {
    if (emsIRAutomationDeviceName.trim() !== "") {
      setCurrentEmsIRAutomationDevices([
        ...currentEmsIRAutomationDevices,
        { name: emsIRAutomationDeviceName, icon: emsIRAutomationDeviceIcon },
      ]);
      setEmsIRAutomationDeviceName("");
      setEmsIRAutomationDeviceIcon("bi bi-lightbulb");
      setIsAddEmsIRAutomationDeviceModalOpen(false);
    }
  };
  const handleAddEmsIRAutomationRoom = () => {
    if (
      currentEmsIRAutomationRoomName.trim() !== "" &&
      currentEmsIRAutomationDevices.length > 0
    ) {
      setEmsIRAutomationRooms([
        ...emsIRAutomationRooms,
        {
          roomName: currentEmsIRAutomationRoomName,
          devices: currentEmsIRAutomationDevices,
          monitoring: emsIRAutomationMonitoring,
        },
      ]);
      setCurrentEmsIRAutomationRoomName("");
      setCurrentEmsIRAutomationDevices([]);
      setEmsIRAutomationMonitoring(false);
    }
  };

  // EMS+EMS(IR)+Automation handlers
  const openAddEmsEmsIRAutomationDeviceModal = () =>
    setIsAddEmsEmsIRAutomationDeviceModalOpen(true);
  const closeAddEmsEmsIRAutomationDeviceModal = () => {
    setIsAddEmsEmsIRAutomationDeviceModalOpen(false);
    setEmsEmsIRAutomationDeviceName("");
    setEmsEmsIRAutomationDeviceIcon("bi bi-lightbulb");
  };
  const handleAddEmsEmsIRAutomationDevice = () => {
    if (emsEmsIRAutomationDeviceName.trim() !== "") {
      setCurrentEmsEmsIRAutomationDevices([
        ...currentEmsEmsIRAutomationDevices,
        {
          name: emsEmsIRAutomationDeviceName,
          icon: emsEmsIRAutomationDeviceIcon,
        },
      ]);
      setEmsEmsIRAutomationDeviceName("");
      setEmsEmsIRAutomationDeviceIcon("bi bi-lightbulb");
      setIsAddEmsEmsIRAutomationDeviceModalOpen(false);
    }
  };
  const handleAddEmsEmsIRAutomationRoom = () => {
    if (
      currentEmsEmsIRAutomationRoomName.trim() !== "" &&
      currentEmsEmsIRAutomationDevices.length > 0
    ) {
      setEmsEmsIRAutomationRooms([
        ...emsEmsIRAutomationRooms,
        {
          roomName: currentEmsEmsIRAutomationRoomName,
          devices: currentEmsEmsIRAutomationDevices,
          monitoring: emsEmsIRAutomationMonitoring,
        },
      ]);
      setCurrentEmsEmsIRAutomationRoomName("");
      setCurrentEmsEmsIRAutomationDevices([]);
      setEmsEmsIRAutomationMonitoring(false);
    }
  };

  // EMS+EMS(IR) handlers (room name only)
  const handleAddEmsEmsIRRoom = () => {
    if (currentEmsEmsIRRoomName.trim() !== "") {
      setEmsEmsIRRooms([
        ...emsEmsIRRooms,
        { roomName: currentEmsEmsIRRoomName },
      ]);
      setCurrentEmsEmsIRRoomName("");
    }
  };
  console.log("EMS + EMS(IR) Rooms:", emsEmsIRRooms);
  console.log("EMS + EMS(IR) + Automation Rooms:", emsEmsIRAutomationRooms);
  console.log("EMS + Automation Rooms:", emsAutomationRooms);
  console.log("EMS(IR) + Automation Rooms:", emsIRAutomationRooms);
  console.log("Automation Rooms:", automationRooms);
  console.log("Rooms:", rooms);
  const openChangePasswordModal = (user) => {
    setUserToChangePassword(user);
    setNewPassword(""); // Clear previous values
    setConfirmNewPassword(""); // Clear previous values
    setIsChangePasswordModalOpen(true);
  };

  const closeChangePasswordModal = () => {
    setUserToChangePassword(null);
    setNewPassword("");
    setConfirmNewPassword("");
    setIsChangePasswordModalOpen(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    if (!userToChangePassword || !userToChangePassword._id) {
      alert("No user selected for password change.");
      return;
    }

    try {
      const response = await axios.post(
        `https://emsbackend-eight.vercel.app/api/user/changePassword`,
        { newPassword: newPassword, UserId: userToChangePassword._id }
      );

      if (response.status === 200) {
        alert("Password updated successfully!");
        closeChangePasswordModal();
        // Optionally, refresh the user list or update the specific user's data
        // For simplicity, we'll re-fetch all users. In a larger app, you might update just the one user.
        const updatedUsers = users.map((u) =>
          u._id === userToChangePassword._id
            ? { ...u, Password: newPassword }
            : u
        );
        setUsers(updatedUsers);
      } else {
        alert(response.data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert(
        "Error changing password: " +
          (error.response?.data?.message || error.message)
      );
    }
  };
  const openChangeStatusModal = (user) => {
    setUserToChangeStatus(user);
    setNewServiceStatus(user.ServiceStatus); // Set initial status to current user's status
    setIsChangeStatusModalOpen(true);
  };

  const closeChangeStatusModal = () => {
    setUserToChangeStatus(null);
    setNewServiceStatus(false);
    setIsChangeStatusModalOpen(false);
  };

  const handleChangeStatus = async (e) => {
    e.preventDefault();

    if (!userToChangeStatus || !userToChangeStatus._id) {
      alert("No user selected for status change.");
      return;
    }

    try {
      const response = await axios.post(
        `https://emsbackend-eight.vercel.app/api/user/changeStatus`,
        { ServiceStatus: newServiceStatus, id: userToChangeStatus._id }
      );

      if (response.status === 200) {
        alert("Status updated successfully!");
        closeChangeStatusModal();
        // Update the user in the local state to reflect the new status
        const updatedUsers = users.map((u) =>
          u._id === userToChangeStatus._id
            ? { ...u, ServiceStatus: newServiceStatus }
            : u
        );
        setUsers(updatedUsers);
      } else {
        alert(response.data.message || "Failed to change status.");
      }
    } catch (error) {
      console.error("Error changing status:", error);
      alert(
        "Error changing status: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const renderRoomFields = () => {
    // EMS (Image 1)
    if (selectedService === "EMS") {
      return (
        // Only show "Add Room" button (Image 1)
        null
      );
    }
    // IR (Image 2)
    if (selectedService === "IR") {
      return (
        <>
          <h5 style={{ marginTop: 24 }}>Add Room Details</h5>
          <Form.Group style={{ display: "inline-block" }} className="mb-3 w-50">
            <Form.Label>Room Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </Form.Group>
          {/* Render added rooms */}
          <div style={{ marginTop: 16 }}>
            {rooms.map((room, idx) => (
              <div
                key={idx}
                style={{
                  background: "#e0e0e0",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  marginBottom: "8px",
                  display: "inline-block",
                }}
              >
                {room.roomName}
              </div>
            ))}
          </div>
          <button
            variant="primary"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: 24,
            }}
            type="button"
            onClick={handleAddRoomEMSIR}
          >
            Add Room
          </button>
        </>
      );
    }
    // EMS (IR) (Image 2)
    if (selectedService === "EMS (IR)") {
      return (
        <>
          <h5 style={{ marginTop: 24 }}>Add Room Details</h5>
          <Form.Group style={{ display: "inline-block" }} className="mb-3 w-50">
            <Form.Label>Room Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </Form.Group>
          {/* Render added rooms */}
          <div style={{ marginTop: 16 }}>
            {rooms.map((room, idx) => (
              <div
                key={idx}
                style={{
                  background: "#e0e0e0",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  marginBottom: "8px",
                  display: "inline-block",
                }}
              >
                {room.roomName}
              </div>
            ))}
          </div>
          <button
            variant="primary"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: 24,
            }}
            type="button"
            onClick={handleAddRoomEMSIR}
          >
            Add Room
          </button>
        </>
      );
    }
    // Automation (Image 3)
    if (selectedService === "Automation") {
      return (
        <>
          <h5 style={{ marginTop: 24 }}>Add Room Details</h5>
          <Form.Group style={{ display: "inline-block" }} className="mb-3 w-50">
            <Form.Label>Room Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={currentRoomName}
              onChange={(e) => setCurrentRoomName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Devices</Form.Label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {currentDevices.map((device, index) => (
                <Button
                  key={index}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  disabled
                >
                  <i className={device.icon} style={{ marginRight: 4 }}></i>
                  {device.name}
                </Button>
              ))}
              <Button
                variant="outline-primary"
                style={{ borderRadius: "20px" }}
                onClick={openAddDeviceModal}
              >
                + Add
              </Button>
            </div>
          </Form.Group>
          <button
            variant="primary"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            type="button"
            onClick={handleAddAutomationRoom}
          >
            Add Room
          </button>
          {/* Show added rooms and their devices */}
          <div style={{ marginTop: 16 }}>
            {automationRooms.map((room, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: "bold" }}>{room.roomName}</div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {room.devices.map((dev, didx) => (
                    <span
                      key={didx}
                      style={{
                        background: "#e0e0e0",
                        borderRadius: "10px",
                        padding: "6px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <i className={dev.icon}></i> {dev.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    // Automation(HD) (Image 4)
    if (selectedService === "Automation(HD)") {
      return (
        <>
          <h5 style={{ marginTop: 24 }}>Add Room Details</h5>
          <Form.Group style={{ display: "inline-block" }} className="mb-3 w-50">
            <Form.Label>Room Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={currentHDRoomName}
              onChange={(e) => setCurrentHDRoomName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Devices</Form.Label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {currentHDDevices.map((device, index) => (
                <Button
                  key={index}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  disabled
                >
                  <i className={device.icon} style={{ marginRight: 4 }}></i>
                  {device.name}
                </Button>
              ))}
              <Button
                variant="outline-primary"
                style={{ borderRadius: "20px" }}
                onClick={openAddHDDeviceModal}
              >
                + Add
              </Button>
            </div>
          </Form.Group>
          <button
            variant="primary"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            type="button"
            onClick={handleAddAutomationHDRoom}
          >
            Add Room
          </button>
          {/* Show added rooms and their devices */}
          <div style={{ marginTop: 16 }}>
            {automationHDRooms.map((room, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: "bold" }}>{room.roomName}</div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {room.devices.map((dev, didx) => (
                    <span
                      key={didx}
                      style={{
                        background: "#e0e0e0",
                        borderRadius: "10px",
                        padding: "6px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <i className={dev.icon}></i> {dev.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    // EMS+Automation (Image 5)
    if (selectedService === "EMS+Automation") {
      return (
        <>
          <h5 style={{ marginTop: 24 }}>Add Room Details</h5>
          <Form.Group style={{ display: "inline-block" }} className="mb-3 w-50">
            <Form.Label>Room Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={currentEmsAutomationRoomName}
              onChange={(e) => setCurrentEmsAutomationRoomName(e.target.value)}
            />
          </Form.Group>
          <Form.Group style={{ display: "inline-block" }} className="ms-3">
            <Form.Check
              type="checkbox"
              label="Monitoring"
              id="monitoringCheckbox"
              checked={emsAutomationMonitoring}
              onChange={(e) => setEmsAutomationMonitoring(e.target.checked)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Devices</Form.Label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {currentEmsAutomationDevices.map((device, index) => (
                <Button
                  key={index}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  disabled
                >
                  <i className={device.icon} style={{ marginRight: 4 }}></i>
                  {device.name}
                </Button>
              ))}
              <Button
                variant="outline-primary"
                style={{ borderRadius: "20px" }}
                onClick={openAddEmsAutomationDeviceModal}
              >
                + Add
              </Button>
            </div>
          </Form.Group>
          <button
            variant="primary"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            type="button"
            onClick={handleAddEmsAutomationRoom}
          >
            Add Room
          </button>
          {/* Show added rooms and their devices */}
          <div style={{ marginTop: 16 }}>
            {emsAutomationRooms.map((room, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: "bold" }}>
                  {room.roomName}{" "}
                  {room.monitoring ? (
                    <span style={{ color: "#007bff", marginLeft: 8 }}>
                      (Monitoring)
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {room.devices.map((dev, didx) => (
                    <span
                      key={didx}
                      style={{
                        background: "#e0e0e0",
                        borderRadius: "10px",
                        padding: "6px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <i className={dev.icon}></i> {dev.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (selectedService === "EMS(IR) + Automation") {
      return (
        <>
          <h5 style={{ marginTop: 24 }}>Add Room Details</h5>
          <Form.Group style={{ display: "inline-block" }} className="mb-3 w-50">
            <Form.Label>Room Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={currentEmsIRAutomationRoomName}
              onChange={(e) =>
                setCurrentEmsIRAutomationRoomName(e.target.value)
              }
            />
          </Form.Group>
          <Form.Group style={{ display: "inline-block" }} className="ms-3">
            <Form.Check
              type="checkbox"
              label="Monitoring"
              id="monitoringCheckbox"
              checked={emsIRAutomationMonitoring}
              onChange={(e) => setEmsIRAutomationMonitoring(e.target.checked)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Devices</Form.Label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {currentEmsIRAutomationDevices.map((device, index) => (
                <Button
                  key={index}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  disabled
                >
                  <i className={device.icon} style={{ marginRight: 4 }}></i>
                  {device.name}
                </Button>
              ))}
              <Button
                variant="outline-primary"
                style={{ borderRadius: "20px" }}
                onClick={openAddEmsIRAutomationDeviceModal}
              >
                + Add
              </Button>
            </div>
          </Form.Group>
          <button
            variant="primary"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            type="button"
            onClick={handleAddEmsIRAutomationRoom}
          >
            Add Room
          </button>
          {/* Show added rooms and their devices */}
          <div style={{ marginTop: 16 }}>
            {emsIRAutomationRooms.map((room, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: "bold" }}>
                  {room.roomName}{" "}
                  {room.monitoring ? (
                    <span style={{ color: "#007bff", marginLeft: 8 }}>
                      (Monitoring)
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {room.devices.map((dev, didx) => (
                    <span
                      key={didx}
                      style={{
                        background: "#e0e0e0",
                        borderRadius: "10px",
                        padding: "6px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <i className={dev.icon}></i> {dev.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    if (selectedService === "EMS + EMS(IR) + Automation") {
      return (
        <>
          <h5 style={{ marginTop: 24 }}>Add Room Details</h5>
          <Form.Group style={{ display: "inline-block" }} className="mb-3 w-50">
            <Form.Label>Room Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={currentEmsEmsIRAutomationRoomName}
              onChange={(e) =>
                setCurrentEmsEmsIRAutomationRoomName(e.target.value)
              }
            />
          </Form.Group>
          <Form.Group style={{ display: "inline-block" }} className="ms-3">
            <Form.Check
              type="checkbox"
              label="Monitoring"
              id="monitoringCheckbox"
              checked={emsEmsIRAutomationMonitoring}
              onChange={(e) =>
                setEmsEmsIRAutomationMonitoring(e.target.checked)
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Devices</Form.Label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {currentEmsEmsIRAutomationDevices.map((device, index) => (
                <Button
                  key={index}
                  variant="outline-secondary"
                  style={{
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  disabled
                >
                  <i className={device.icon} style={{ marginRight: 4 }}></i>
                  {device.name}
                </Button>
              ))}
              <Button
                variant="outline-primary"
                style={{ borderRadius: "20px" }}
                onClick={openAddEmsEmsIRAutomationDeviceModal}
              >
                + Add
              </Button>
            </div>
          </Form.Group>
          <button
            variant="primary"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
            type="button"
            onClick={handleAddEmsEmsIRAutomationRoom}
          >
            Add Room
          </button>
          {/* Show added rooms and their devices */}
          <div style={{ marginTop: 16 }}>
            {emsEmsIRAutomationRooms.map((room, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: "bold" }}>
                  {room.roomName}{" "}
                  {room.monitoring ? (
                    <span style={{ color: "#007bff", marginLeft: 8 }}>
                      (Monitoring)
                    </span>
                  ) : null}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 4,
                  }}
                >
                  {room.devices.map((dev, didx) => (
                    <span
                      key={didx}
                      style={{
                        background: "#e0e0e0",
                        borderRadius: "10px",
                        padding: "6px 12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <i className={dev.icon}></i> {dev.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    }
    // EMS + EMS(IR) (Image 1)
    if (selectedService === "EMS + EMS(IR)") {
      return (
        <>
          <h5 style={{ marginTop: 24 }}>Add Room Details</h5>
          <Form.Group style={{ display: "inline-block" }} className="mb-3 w-50">
            <Form.Label>Room Name:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room name"
              value={currentEmsEmsIRRoomName}
              onChange={(e) => setCurrentEmsEmsIRRoomName(e.target.value)}
            />
          </Form.Group>
          {/* Render added rooms */}
          <div style={{ marginTop: 16 }}>
            {emsEmsIRRooms.map((room, idx) => (
              <div
                key={idx}
                style={{
                  background: "#e0e0e0",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  marginBottom: "8px",
                  display: "inline-block",
                }}
              >
                {room.roomName}
              </div>
            ))}
          </div>
          <button
            variant="primary"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: 24,
            }}
            type="button"
            onClick={handleAddEmsEmsIRRoom}
          >
            Add Room
          </button>
        </>
      );
    }
    // fallback
    return null;
  };

  const renderModalContent = () => {
    if (step === "personalDetails") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "200px",
              borderRight: "2px solid #e0e0e0",
              paddingBottom: "1rem",
            }}
          >
            <h4 className="mb-4">Add User</h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: step === "personalDetails" ? "#0d6efd" : "#000",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      step === "personalDetails" ? "#0d6efd" : "#ccc"
                    }`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    setStep("personalDetails");
                  }}
                >
                  1
                </div>
                <span>Personal Details</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: step === "servicesDetails" ? "#0d6efd" : "#000",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      step === "servicesDetails" ? "#0d6efd" : "#ccc"
                    }`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  2
                </div>
                <span>Services</span>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              padding: "10px",
              background: "#f0f0f0",
              borderRadius: "20px",
              width: "100%",
            }}
          >
            <h5>Personal Details</h5>
            <Form style={{ width: "100%", height: "100%" }}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>CNIC Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter CNIC"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>User ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="User ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <button
                variant="primary"
                onClick={handleNext}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "999px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Next
              </button>
            </Form>
          </div>
        </div>
      );
    } else if (step === "servicesDetails") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "200px",
              borderRight: "2px solid #e0e0e0",
              paddingBottom: "1rem",
            }}
          >
            <h4 className="mb-4">Add User</h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: step === "personalDetails" ? "#0d6efd" : "#000",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      step === "personalDetails" ? "#0d6efd" : "#ccc"
                    }`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  1
                </div>
                <span>Personal Details</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: step === "servicesDetails" ? "#0d6efd" : "#000",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    border: `2px solid ${
                      step === "servicesDetails" ? "#0d6efd" : "#ccc"
                    }`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  2
                </div>
                <span>Services</span>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              padding: "10px",
              background: "#f0f0f0",
              borderRadius: "20px",
              width: "100%",
            }}
          >
            <h5>Services Details</h5>
            <Form
              style={{ width: "100%", height: "100%" }}
              onSubmit={handleCreateUser}
            >
              <Form.Group
                style={{ display: "inline-block" }}
                className="mb-3 w-50"
              >
                <Form.Label>Services</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    setShowRoomField(false);
                  }}
                >
                  <option value="EMS">EMS</option>
                  <option value="IR">IR</option>
                  <option value="EMS (IR)">EMS (IR)</option>
                  <option value="Automation">Automation</option>
                  <option value="Automation(HD)">Automation(HD)</option>
                  <option value="EMS+Automation">EMS+Automation</option>
                  <option value="EMS(IR) + Automation">
                    EMS(IR) + Automation
                  </option>
                  <option value="EMS + EMS(IR) + Automation">
                    EMS + EMS(IR) + Automation
                  </option>
                  <option value="EMS + EMS(IR)">EMS + EMS(IR)</option>
                </Form.Control>
              </Form.Group>

              <Form.Group
                style={{ display: "inline-block" }}
                className="mb-3 w-50"
              >
                <Form.Label>User Type</Form.Label>
                <Form.Control as="select" id="userTypeSelect">
                  <option value="Commercial">Commercial(3KW)</option>
                  <option value="Residential">Residential(3KW)</option>
                </Form.Control>
              </Form.Group>

              {/* Show fields based on selected service */}
              {selectedService === "EMS" || selectedService === "IR" ? (
                renderRoomFields()
              ) : showRoomField ? (
                renderRoomFields()
              ) : (
                <button
                  variant="primary"
                  type="submit"
                  style={{
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "0.6rem 1.5rem",
                    borderRadius: "999px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: "pointer",
                    marginRight: 10,
                  }}
                >
                  {selectedService === "EMS" || selectedService === "IR" ? "No Details" : "Show Details"}
                </button>
              )}
              <button
                variant="primary"
                type="submit"
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "0.6rem 1.5rem",
                  borderRadius: "999px",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  marginTop: 10,
                }}
              >
                Create User
              </button>
            </Form>
          </div>
        </div>
      );
    }
  };

  const handleExport = () => {
    // Filter the users based on the current search query before exporting
    const filteredUsers = users.filter((user) => {
      const query = searchQuery.toLowerCase();
      return (
        user?.UserId?.toLowerCase().includes(query) ||
        user?.Username?.toLowerCase().includes(query) ||
        user?.Service?.toLowerCase().includes(query)
      );
    });

    // Prepare data for Excel
    const dataToExport = filteredUsers.map((user) => ({
      "User ID": user.UserId,
      Name: user.Username,
      Phone: user.Phone,
      Services: user.Service,
      Password: user.Password, // Be cautious about exporting sensitive data like passwords
      "Service Status": user.ServiceStatus ? "Active" : "Deactive",
      CNIC: user.CNIC,
      Address: user.Address,
      "Property Type": user.PropertyType,
      // You can add more fields if needed
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "users_data.xlsx");
  };
  return (
    <>
      <Header onAddUser={openModal} />
      <Container
        fluid
        style={{
          padding: "2rem",
          backgroundColor: "#f5f5f5",
          maxWidth: "100%",
        }}
      >
        <Row className="mb-3">
          <Col
            xs={12}
            className="d-flex justify-content-between align-items-center"
            style={{ flexWrap: "wrap" }}
          >
            <h3
              className="fs-1"
              style={{
                fontSize: "1.5rem",
                marginBottom: "1rem",
                fontWeight: "bold",
              }}
            >
              Welcome Zayan!
            </h3>
            <button
              onClick={handleExport}
              style={{
                backgroundColor: "#28a745", // Green color for export
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "0.9rem",
                cursor: "pointer",
                marginLeft: "auto",
                marginRight:20 // Add some margin to separate from other buttons
              }}
            >
              Export In Excel
            </button>
            {/* Search input and buttons */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#D9D9D9",
                borderRadius: "20px",
                padding: "0.5rem 1rem",
                gap: "10px",
                flex: "1",
                maxWidth: "400px",
              }}
            >
              <input
                type="text"
                placeholder="Search User"
                // Add value and onChange handler
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  fontSize: "1rem",
                  color: "#000",
                }}
              />
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "#000",
                }}
              >
                <i className="bi bi-search"></i>
              </button>
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  color: "#000",
                }}
              >
                <i className="bi bi-funnel-fill"></i>
              </button>
            </div>
          </Col>
        </Row>

        {/* Table to display user data */}
        <Row>
          <Col xs={12}>
            <div
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                borderRadius: "30px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.9rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f0f0f0",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "0.75rem", fontWeight: "bold" }}>
                      User ID
                    </th>
                    <th style={{ padding: "0.75rem", fontWeight: "bold" }}>
                      Name
                    </th>
                    <th style={{ padding: "0.75rem", fontWeight: "bold" }}>
                      Phone
                    </th>

                    <th style={{ padding: "0.75rem", fontWeight: "bold" }}>
                      Services
                    </th>
                    <th style={{ padding: "0.75rem", fontWeight: "bold" }}>
                      Password
                    </th>
                    <th style={{ padding: "0.75rem", fontWeight: "bold" }}>
                      Active
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users
                    .filter((user) => {
                      const query = searchQuery.toLowerCase();
                      return (
                        user?.UserId?.toLowerCase().includes(query) ||
                        user?.Username?.toLowerCase().includes(query) ||
                        user?.Service?.toLowerCase().includes(query)
                      );
                    })
                    .map((user, index) => (
                      <tr
                        key={user.id}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#D9D9D9" : "#FFFFFF",
                        }}
                      >
                        <td style={{ padding: "0.75rem" }}>{user?.UserId}</td>
                        <td style={{ padding: "0.75rem" }}>{user?.Username}</td>
                        <td style={{ padding: "0.75rem" }}>{user?.Phone}</td>
                        <td style={{ padding: "0.75rem" }}>{user?.Service}</td>
                        <td style={{ padding: "0.75rem" }}>{user?.Password}</td>

                        <td style={{ padding: "0.75rem" }}>
                          {user?.ServiceStatus ? "Active" : "Deactive"}
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          <Button
                            variant="link"
                            onClick={() => openChangePasswordModal(user)}
                            style={{
                              padding: 0,
                              minWidth: "unset",
                              marginRight: "5px",
                            }} // Adjust styling for a small button
                          >
                            <i className="bi bi-three-dots"></i>{" "}
                            {/* Three-dot icon */}
                          </Button>
                          <Button
                            variant="link"
                            onClick={() => openChangeStatusModal(user)}
                            style={{ padding: 0, minWidth: "unset" }}
                            title="Change Status"
                          >
                            <i className="bi bi-toggle-on"></i>{" "}
                            {/* Toggle icon for status */}
                          </Button>
                          <Button
                            variant="link"
                            onClick={() => openDeleteModal(user)} // Pass the current user object
                            style={{
                              padding: 0,
                              minWidth: "unset",
                              color: "#dc3545",
                            }} // Red color for delete
                            title="Delete User"
                          >
                            <i className="bi bi-trash"></i> {/* Trash icon */}
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "800px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "1rem",
            borderRadius: "10px",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        {renderModalContent()}
      </Modal>

      {/* Add Appliance Modal */}
      <Modal
        isOpen={isAddApplianceModalOpen}
        onRequestClose={closeAddApplianceModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "50vh",
            maxWidth: "400px",
            padding: "2rem",
            borderRadius: "20px",
            backgroundColor: "#f9f9f9",
            border: "none",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>Add Appliances</h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <button
            style={{
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "12px",
              padding: "0.5rem 1rem",
              fontSize: "1.5rem",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i className="bi bi-hdd" style={{ marginRight: "0.5rem" }}></i>
            <i className="bi bi-caret-down-fill"></i>
          </button>

          <input
            type="text"
            value={applianceName}
            onChange={(e) => setApplianceName(e.target.value)}
            style={{
              backgroundColor: "#ddd",
              border: "none",
              borderRadius: "12px",
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              width: "100%",
            }}
            placeholder="Appliance Name"
          />
        </div>

        <div style={{ textAlign: "right" }}>
          <button
            onClick={closeAddApplianceModal}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Add Device Modal for Automation */}
      <Modal
        isOpen={isAddDeviceModalOpen}
        onRequestClose={closeAddDeviceModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "50vh",
            maxWidth: "400px",
            padding: "2rem",
            borderRadius: "20px",
            backgroundColor: "#f9f9f9",
            border: "none",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>Add Device</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          {/* Icon dropdown */}
          <select
            value={deviceIcon}
            onChange={(e) => setDeviceIcon(e.target.value)}
            style={{
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "12px",
              padding: "0.5rem 1rem",
              fontSize: "1.5rem",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <option value="bi bi-lightbulb">💡</option>
            <option value="bi bi-snow">❄️</option>
            <option value="bi bi-fan">🌀</option>
            <option value="bi bi-lightning-charge">⚡</option>
          </select>
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            style={{
              backgroundColor: "#ddd",
              border: "none",
              borderRadius: "12px",
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              width: "100%",
            }}
            placeholder="Device Name"
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <button
            onClick={handleAddDevice}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Add Device
          </button>
        </div>
      </Modal>

      {/* Add Device Modal for Automation(HD) */}
      <Modal
        isOpen={isAddHDDeviceModalOpen}
        onRequestClose={closeAddHDDeviceModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "50vh",
            maxWidth: "400px",
            padding: "2rem",
            borderRadius: "20px",
            backgroundColor: "#f9f9f9",
            border: "none",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>Add Device</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <select
            value={hdDeviceIcon}
            onChange={(e) => setHDDeviceIcon(e.target.value)}
            style={{
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "12px",
              padding: "0.5rem 1rem",
              fontSize: "1.5rem",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <option value="bi bi-lightbulb">💡</option>
            <option value="bi bi-snow">❄️</option>
            <option value="bi bi-fan">🌀</option>
            <option value="bi bi-lightning-charge">⚡</option>
          </select>
          <input
            type="text"
            value={hdDeviceName}
            onChange={(e) => setHDDeviceName(e.target.value)}
            style={{
              backgroundColor: "#ddd",
              border: "none",
              borderRadius: "12px",
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              width: "100%",
            }}
            placeholder="Device Name"
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <button
            onClick={handleAddHDDevice}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Add Device
          </button>
        </div>
      </Modal>

      {/* Add Device Modal for EMS+Automation */}
      <Modal
        isOpen={isAddEmsAutomationDeviceModalOpen}
        onRequestClose={closeAddEmsAutomationDeviceModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "50vh",
            maxWidth: "400px",
            padding: "2rem",
            borderRadius: "20px",
            backgroundColor: "#f9f9f9",
            border: "none",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>Add Device</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <select
            value={emsAutomationDeviceIcon}
            onChange={(e) => setEmsAutomationDeviceIcon(e.target.value)}
            style={{
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "12px",
              padding: "0.5rem 1rem",
              fontSize: "1.5rem",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <option value="bi bi-lightbulb">💡 </option>
            <option value="bi bi-snow">❄️</option>
            <option value="bi bi-fan">🌀 </option>
            <option value="bi bi-lightning-charge">⚡</option>
          </select>
          <input
            type="text"
            value={emsAutomationDeviceName}
            onChange={(e) => setEmsAutomationDeviceName(e.target.value)}
            style={{
              backgroundColor: "#ddd",
              border: "none",
              borderRadius: "12px",
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              width: "100%",
            }}
            placeholder="Device Name"
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <button
            onClick={handleAddEmsAutomationDevice}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Add Device
          </button>
        </div>
      </Modal>

      {/* Add Device Modal for EMS(IR)+Automation */}
      <Modal
        isOpen={isAddEmsIRAutomationDeviceModalOpen}
        onRequestClose={closeAddEmsIRAutomationDeviceModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "50vh",
            maxWidth: "400px",
            padding: "2rem",
            borderRadius: "20px",
            backgroundColor: "#f9f9f9",
            border: "none",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>Add Device</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <select
            value={emsIRAutomationDeviceIcon}
            onChange={(e) => setEmsIRAutomationDeviceIcon(e.target.value)}
            style={{
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "12px",
              padding: "0.5rem 1rem",
              fontSize: "1.5rem",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <option value="bi bi-lightbulb">💡</option>
            <option value="bi bi-snow">❄️</option>
            <option value="bi bi-fan">🌀</option>
            <option value="bi bi-lightning-charge">⚡</option>
          </select>
          <input
            type="text"
            value={emsIRAutomationDeviceName}
            onChange={(e) => setEmsIRAutomationDeviceName(e.target.value)}
            style={{
              backgroundColor: "#ddd",
              border: "none",
              borderRadius: "12px",
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              width: "100%",
            }}
            placeholder="Device Name"
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <button
            onClick={handleAddEmsIRAutomationDevice}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Add Device
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
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
            maxWidth: "400px",
            padding: "2rem",
            borderRadius: "10px",
            textAlign: "center",
          },
        }}
      >
        <h2 style={{ color: "#dc3545", marginBottom: "1rem" }}>
          Confirm Account Deletion
        </h2>
        <p
          style={{ fontSize: "1.1rem", color: "#333", marginBottom: "1.5rem" }}
        >
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <button
            onClick={handleDeleteAccount}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "0.8rem 1.5rem",
              borderRadius: "5px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Delete Account
          </button>
          <button
            onClick={closeDeleteModal}
            style={{
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              padding: "0.8rem 1.5rem",
              borderRadius: "5px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </Modal>
      {/* Add Device Modal for EMS+EMS(IR)+Automation */}
      <Modal
        isOpen={isAddEmsEmsIRAutomationDeviceModalOpen}
        onRequestClose={closeAddEmsEmsIRAutomationDeviceModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "50vh",
            maxWidth: "400px",
            padding: "2rem",
            borderRadius: "20px",
            backgroundColor: "#f9f9f9",
            border: "none",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>Add Device</h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <select
            value={emsEmsIRAutomationDeviceIcon}
            onChange={(e) => setEmsEmsIRAutomationDeviceIcon(e.target.value)}
            style={{
              backgroundColor: "#e0e0e0",
              border: "none",
              borderRadius: "12px",
              padding: "0.5rem 1rem",
              fontSize: "1.5rem",
              marginRight: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <option value="bi bi-lightbulb">💡</option>
            <option value="bi bi-snow">❄️</option>
            <option value="bi bi-fan">🌀</option>
            <option value="bi bi-lightning-charge">⚡</option>
          </select>
          <input
            type="text"
            value={emsEmsIRAutomationDeviceName}
            onChange={(e) => setEmsEmsIRAutomationDeviceName(e.target.value)}
            style={{
              backgroundColor: "#ddd",
              border: "none",
              borderRadius: "12px",
              padding: "0.6rem 1rem",
              fontSize: "1rem",
              width: "100%",
            }}
            placeholder="Device Name"
          />
        </div>
        <div style={{ textAlign: "right" }}>
          <button
            onClick={handleAddEmsEmsIRAutomationDevice}
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "0.6rem 1.5rem",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Add Device
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isChangePasswordModalOpen}
        onRequestClose={closeChangePasswordModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "450px", // Adjusted max-width for better fit
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "2rem",
            borderRadius: "10px",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>
          Change Password for {userToChangePassword?.Username}
        </h3>
        <Form onSubmit={handleChangePassword}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <Button
              variant="secondary"
              onClick={closeChangePasswordModal}
              style={{
                backgroundColor: "#6c757d", // Bootstrap secondary color
                color: "white",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "999px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "999px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Change Password
            </Button>
          </div>
        </Form>
      </Modal>
      {/* Change Status Modal */}
      <Modal
        isOpen={isChangeStatusModalOpen}
        onRequestClose={closeChangeStatusModal}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "450px",
            maxHeight: "80vh",
            overflowY: "auto",
            padding: "2rem",
            borderRadius: "10px",
          },
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>
          Change Status for {userToChangeStatus?.Username}
        </h3>
        <Form onSubmit={handleChangeStatus}>
          <Form.Group className="mb-3">
            <Form.Label>Service Status</Form.Label>
            <Form.Control
              as="select"
              value={newServiceStatus ? "Active" : "Deactive"}
              onChange={(e) => setNewServiceStatus(e.target.value === "Active")}
            >
              <option value="Active">Active</option>
              <option value="Deactive">Deactive</option>
            </Form.Control>
          </Form.Group>
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
          >
            <Button
              variant="secondary"
              onClick={closeChangeStatusModal}
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "999px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "999px",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Update Status
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
