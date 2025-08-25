const express = require("express");
const router = express.Router();

const {
  updatePricingByType,
  findPricingByTypePost,
} = require("../controller/pricing"); // adjust path as needed

// Create new pricing (if needed)
router.post("/update", updatePricingByType);
router.post("/watch", findPricingByTypePost);

// Update pricing by Type

// Find pricing by Type (POST)

module.exports = router;
