const User = require("../models/user.js");
const jwt = require("jsonwebtoken");
const createUser = async (req, res) => {
  try {
    const {
      Username,
      CNIC,
      Address,
      UserId,
      Phone,
      Password,
      Service,
      Room,
      ServiceStatus,
      unitsNotification,
      PropertyType, // <-- Added this line
    } = req.body;

    const newUser = new User({
      Username,
      CNIC,
      Address,
      UserId,
      Phone,
      Password: UserId,
      Service,
      Room, // should be an array of rooms, each containing devices
      ServiceStatus,
      unitsNotification,
      PropertyType, // <-- And this line
    });

    await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Duplicate CNIC, Phone or UserId" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

// SIGN IN
const signin = async (req, res) => {
  try {
    const { UserId, Password } = req.body;

    // Find user by UserId
    const user = await User.findOne({ UserId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Password check
    // If using bcrypt:
    // const isMatch = await bcrypt.compare(Password, user.Password);
    const isMatch = Password === user.Password;

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, UserId: user.UserId },
      "your_secret_key", // Replace with env variable in production
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Signin successful",
      token,
      user: {
        Username: user.Username,
        UserId: user.UserId,
        CNIC: user.CNIC,
        Address: user.Address,
        Phone: user.Phone,
        Service: user.Service,
        ServiceStatus: user.ServiceStatus,
        Room: user.Room,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // fetch all users
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateServiceStatus = async (req, res) => {
  try {
    const { UserId, ServiceStatus } = req.body;

    if (typeof ServiceStatus !== "boolean") {
      return res.status(400).json({ message: "ServiceStatus must be boolean" });
    }

    const user = await User.findOneAndUpdate(
      { UserId },
      { ServiceStatus },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with UserId '${UserId}' not found` });
    }

    return res.status(200).json({
      message: "ServiceStatus updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating service status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { UserId, newPassword } = req.body;
    console.log(req.body);

    if (!UserId || !newPassword) {
      return res
        .status(400)
        .json({ message: "UserId and newPassword are required" });
    }

    const user = await User.findOneAndUpdate(
      { _id: UserId },
      { Password: newPassword },
      { new: true }
    );
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const changeUserStatus = async (req, res) => {
  try {
    const userId = req.body.id; // Get user ID from the URL parameters
    const { ServiceStatus } = req.body; // Get ServiceStatus from the request body

    // Validate input
    if (ServiceStatus === undefined || typeof ServiceStatus !== "boolean") {
      return res.status(400).json({
        message: "ServiceStatus (boolean) is required in the request body.",
      });
    }

    // Find the user by ID and update only the ServiceStatus field
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { ServiceStatus: ServiceStatus }, // Update only ServiceStatus
      { new: true } // Return the updated document
    );

    // If no user is found with the given ID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return a success response
    return res
      .status(200)
      .json({ message: "User status updated successfully", user });
  } catch (error) {
    console.error("Error changing user status:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteUser = async (req, res) => {
  console.log(req.body)
  try {
    const { _id } = req.body;

    // Validate input
    if (!_id) {
      return res
        .status(400)
        .json({ message: "_id is required in the request body." });
    }

    // Attempt to delete the user
    const deletedUser = await User.findByIdAndDelete(_id);

    // Check if user was found and deleted
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }
    console.log(deleteUser)
    return res
      .status(200)
      .json({ message: "User deleted successfully.", deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

const unitsNotification = async (req, res) => {
  try {
    const { UserId, unitsNotification } = req.body;
    if (!UserId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    // Use $set to add or update the unitsNotification field
    const user = await User.findOneAndUpdate(
      { UserId: UserId }, // Find the user by ID
      { unitsNotification }, // Use $set to update the field
      { new: true } // Return the updated document
    );
    console.log("user", user);

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with UserId '${UserId}' not found` });
    }

    return res.status(200).json({
      message: "unitsNotification updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating units notification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }



};

const getUnitsNotification = async (req, res) => {
  console.log("getUnitsNotification called");
  try {
    const { UserId } = req.query;

    if (!UserId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    const user = await User.findOne({ UserId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "Units notification fetched successfully",
      unitsNotification: user.unitsNotification,
    });
  }
  catch (error) {
    console.error("Error fetching units notification:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {
  createUser,
  signin,
  getAllUsers,
  updateServiceStatus,
  changePassword,
  changeUserStatus,
  deleteUser,
  unitsNotification,
  getUnitsNotification
};
