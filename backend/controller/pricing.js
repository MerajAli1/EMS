const Pricing = require("../models/pricing");

const updatePricingByType = async (req, res) => {
  try {
    const { Type, Watt } = req.body;

    if (!["Commercial", "Residential"].includes(Type)) {
      return res.status(400).json({ message: "Invalid Type" });
    }

    const updatedPricing = await Pricing.findOneAndUpdate(
      { Type },
      { $set: { Watt } }, // Only update Watt field
      { new: true, runValidators: true }
    );

    if (!updatedPricing) {
      return res
        .status(404)
        .json({ message: `Pricing document for '${Type}' not found` });
    }

    return res.status(200).json({
      message: "Pricing updated successfully",
      pricing: updatedPricing,
    });
  } catch (error) {
    console.error("Error updating pricing:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const findPricingByTypePost = async (req, res) => {
  try {
    const { Type } = req.body;

    if (!Type || !["Commercial", "Residential"].includes(Type)) {
      return res.status(400).json({ message: "Invalid or missing Type" });
    }

    const pricing = await Pricing.findOne({ Type });

    if (!pricing) {
      return res
        .status(404)
        .json({ message: `Pricing for type '${Type}' not found` });
    }

    return res.status(200).json(pricing);
  } catch (error) {
    console.error("Error finding pricing:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  updatePricingByType,
  findPricingByTypePost,
};
