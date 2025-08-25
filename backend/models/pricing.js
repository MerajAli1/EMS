const mongoose = require("mongoose");

const pricingSchema = mongoose.Schema({
  Type: {
    type: String,
    enum: ["Commercial", "Residential"], // example values
    required: true,
  },
  Watt: {
    ThreeKW: {
      unit1: { type: Number },
      unit2: { type: Number },
      unit3: { type: Number },
      unit4: { type: Number },
    },
    FiveKW: {
      unit1: { type: Number },
      unit2: { type: Number },
      unit3: { type: Number },
      unit4: { type: Number },
    },
    TenKW: {
      unit1: { type: Number },
      unit2: { type: Number },
      unit3: { type: Number },
      unit4: { type: Number },
    },
  },
});

const Pricing = mongoose.model("Pricing", pricingSchema);

module.exports = Pricing;
