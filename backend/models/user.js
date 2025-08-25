const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  // id is not needed; Mongoose auto-generates `_id`
});

const roomSchema = new mongoose.Schema({
  roomName: { type: String, required: true },
  automation: { type: Boolean, required: true, default: false },
  devices: [deviceSchema],
});

const userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  CNIC: { type: Number, required: true, unique: true },
  Address: { type: String },
  UserId: { type: String, required: true, unique: true },
  Phone: { type: Number, required: true, unique: true },
  Password: { type: String, required: true },
  Service: { type: String, required: true },
  Room: [roomSchema],
  ServiceStatus: {
    type: Boolean,
  },
  unitsNotification:{
    type: String,
    default: 0,
    required: true,
  },
  PropertyType: {
    type: String,
    enum: ["Commercial", "Residential"],
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
