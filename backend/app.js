require('dotenv').config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./database/connect");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = 2000;
const user_routes = require("./routes/user");
const pricing_routes = require("./routes/pricing");

const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- Global Setup for Google Generative AI ---
// Check for the API key to ensure it's available before starting the server.
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('Error: GOOGLE_API_KEY is not set in the .env file. Please add it to run the server.');
  process.exit(1); // Exit if the API key is not found
}
const genAI = new GoogleGenerativeAI(API_KEY);

// --- In-memory cache for API responses ---
// Using a Map for efficient key-value lookups
const apiCache = new Map();

// --- Middleware and Routes ---
app.get("/", (req, res) => {
  res.send("Welcome to anonymous app");
});

//middleware or to set router
app.use(
  cors({
    origin: "*", // Allow requests from this origin
    credentials: true, // Allow sending cookies
  })
);

// --- API Endpoint for Chat ---
app.post('/api/chat', async (req, res) => {
  // Use the conversational model for chat
  const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  // Receive the message and the formatted context data from the frontend
  const userMessage = req.body.message;
  const contextData = req.body.contextData;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    // Create a prompt with the user message and contextual data
    const prompt = `You are a helpful AI assistant for a user's energy monitoring system. Analyze the following energy usage data and answer the user's question. If the user's question is unrelated to the data, answer it generally while still being helpful.
    
    Energy Data:
    ${contextData || "No energy data found for this user."}
    
    User Question:
    ${userMessage}`;

    // Send the prompt to the Gemini model
    const result = await chatModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Send the AI's response back to the frontend
    res.json({ message: text });

  } catch (error) {
    console.error('Error with Gemini API:', error);
    res.status(500).json({ error: 'Failed to get a response from the AI.' });
  }
});

// --- API Endpoint for Predicted Pattern Graph ---
app.post('/api/predict', async (req, res) => {
  // Use a different model that is better for structured data
  const predictionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

  // Extract data sent from the React frontend
  const { contextData, timeFrame } = req.body;

  // Basic validation to ensure data is present
  if (!contextData) {
    return res.status(400).json({ error: 'Context data is required for prediction.' });
  }

  // Create a unique cache key based on the input data
  const cacheKey = `predict-${JSON.stringify(contextData)}-${timeFrame}`;

  // Check the cache first
  if (apiCache.has(cacheKey)) {
    console.log("Serving predict response from cache");
    return res.status(200).json(apiCache.get(cacheKey));
  }

  try {
    // Craft a specific prompt for the AI model to generate JSON
    const prompt = `
      You are a smart home energy data analyst. Your task is to predict the energy usage pattern for the next 1 month based on the provided historical energy usage data.
      
      Historical energy usage (kWh) for the last 1 month:
      ${JSON.stringify(contextData)}
      
      Generate a JSON response containing a single object with two arrays:
      - "labels": an array of strings for the next 1 month (From this month date 23 to next month date 23) (e.g., "23 Aug", "23 Sep", etc.)
      - "data": an array of numbers representing the predicted energy usage in kWh for each corresponding Week.
 
      Do not include any other text or markdown, just the JSON object.
    `;

    // Make the API call to the Gemini model
    const result = await predictionModel.generateContent(prompt);

    // Extract the raw text from the AI's response
    const rawResponse = result.response.text();

    // Log the raw response for debugging purposes
    console.log('Raw Gemini API Prediction Response:', rawResponse);

    // --- Critical Fix ---
    // Use a regex to extract the JSON object, which handles cases where the model
    // might add extra text like "```json" or a conversational preamble.
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Error: No valid JSON found in AI response.');
      return res.status(500).json({ error: 'Failed to get a valid JSON response from the AI.' });
    }
    const jsonString = jsonMatch[0];
    const parsedData = JSON.parse(jsonString);

    // Store the successful response in the cache before sending it
    apiCache.set(cacheKey, parsedData);

    // Send the parsed JSON data back to the frontend
    res.status(200).json(parsedData);

  } catch (error) {
    // Log the detailed error for backend debugging
    console.error('Error during AI prediction:', error);

    // Send a user-friendly error message to the frontend
    res.status(500).json({ error: 'Failed to get a prediction. Please try again.' });
  }
});

// --- NEW: API Endpoint for Predictive Energy Saving Score ---
app.post('/api/predict-score', async (req, res) => {
  const predictiveScoreModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

  const { contextData } = req.body;

  if (!contextData) {
    return res.status(400).json({ error: 'Context data is required for prediction.' });
  }

  // Create a cache key for the predictive score
  const cacheKey = `predict-score-${JSON.stringify(contextData)}`;

  // Check the cache first
  if (apiCache.has(cacheKey)) {
    console.log("Serving predictive score response from cache");
    return res.status(200).json(apiCache.get(cacheKey));
  }

  try {
    const prompt = `
      You are an AI assistant tasked with predicting a user's energy saving score for the upcoming week based on their historical energy usage data. The score is based on five criteria. For each criterion, predict whether the user will meet the standard (true) or not (false).

      Energy data (kWh) over the last week:
      ${JSON.stringify(contextData)}

      The five criteria for a "good" score are:
      - peakHourUsage: The user avoids high energy use during peak hours (e.g., 5 PM - 9 PM).
      - suddenHighUse: There are no significant, sudden spikes in energy consumption.
      - nightTimeUsage: The user has low energy usage during night time (e.g., 12 AM - 6 AM).
      - weeklyChange: The user's total weekly consumption is stable and not increasing.
      - dailyUsageSpread: The user's energy consumption is consistent throughout the day, without large fluctuations.

      Generate a JSON response containing a single object with boolean values for each criterion. The keys must be 'peakHourUsage', 'suddenHighUse', 'nightTimeUsage', 'weeklyChange', and 'dailyUsageSpread'.

      Example JSON response:
      {
        "peakHourUsage": true,
        "suddenHighUse": false,
        "nightTimeUsage": true,
        "weeklyChange": true,
        "dailyUsageSpread": false
      }
    `;

    // Use the structured response feature for a reliable JSON output
    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          peakHourUsage: { type: "BOOLEAN" },
          suddenHighUse: { type: "BOOLEAN" },
          nightTimeUsage: { type: "BOOLEAN" },
          weeklyChange: { type: "BOOLEAN" },
          dailyUsageSpread: { type: "BOOLEAN" }
        }
      }
    };

    const result = await predictiveScoreModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: generationConfig
    });

    const rawResponse = result.response.text();
    const parsedData = JSON.parse(rawResponse);

    // Store the successful response in the cache before sending it
    apiCache.set(cacheKey, parsedData);

    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Error during AI predictive scoring:', error);
    res.status(500).json({ error: 'Failed to predict the score. Please try again.' });
  }
});


// --- NEW: API Endpoint for AI-Driven Analytics ---
app.post('/api/analytics', async (req, res) => {
  const analyticsModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

  const { contextData } = req.body;

  if (!contextData) {
    return res.status(400).json({ error: 'Context data is required for analysis.' });
  }

  // Create a unique cache key based on the input data
  const cacheKey = `analytics-${JSON.stringify(contextData)}`;

  // Check the cache first
  if (apiCache.has(cacheKey)) {
    console.log("Serving analytics response from cache");
    return res.status(200).json(apiCache.get(cacheKey));
  }

  try {
    const prompt = `
      You are an expert energy data analyst. Your task is to analyze the provided energy usage data and provide 3-5 key insights. Each insight should be a short, actionable sentence. You must respond with a JSON array where each object has a 'text' and a 'status' key. The 'status' key should be one of the following strings: 'danger', 'warning', or 'success'.

      Energy data (kWh):
      ${JSON.stringify(contextData)}

      Example JSON response:
      [
        { "text": "Your energy usage is low this week.", "status": "success" },
        { "text": "The system has detected a surge in usage.", "status": "danger" }
      ]
    `;

    // Use the structured response feature for a reliable JSON output
    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            text: { type: "STRING" },
            status: { type: "STRING" }
          }
        }
      }
    };

    const result = await analyticsModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: generationConfig
    });

    const rawResponse = result.response.text();
    const parsedData = JSON.parse(rawResponse);

    // Store the successful response in the cache before sending it
    apiCache.set(cacheKey, parsedData);

    res.status(200).json(parsedData);

  } catch (error) {
    console.error('Error during AI analysis:', error);
    res.status(500).json({ error: 'Failed to generate analytics. Please try again.' });
  }
});

app.use("/api/user", user_routes);
app.use("/api/pricing", pricing_routes);

const start = async () => {
  try {
    await connectDB();
    app.listen(
      2000,
      console.log(`server is running at http://localhost:${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
