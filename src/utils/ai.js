// src/utils/ai.js
// We'll use the Gemini API. Make sure to set up your API key in the environment variable.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const generateMealPlan = async (userData = {}) => {
  // If no API key, return a mock meal plan
  

  const prompt = `Create a detailed one-day meal plan based on Nigerian cuisine.
    The user's data is as follows:
    - Daily calorie target: ${userData.dailyCalories || 2000} calories
    - Goal: ${userData.goal || 'Maintain weight'}
    - Dietary restrictions: ${
      userData.dietaryRestrictions?.join(", ") || "None"
    }
    - Preferences: ${userData.preferences?.join(", ") || "None"}
    - Activity level: ${userData.activityLevel || 'Sedentary'}

    Please provide the response in a valid JSON format with the following structure:
    {
      "day": "Today's date",
      "meals": [
        {
          "type": "breakfast" | "lunch" | "dinner" | "snack",
          "name": "Nigerian dish name",
          "foods": [
            {
              "name": "Food item",
              "serving": "Serving size (e.g., 1 cup, 100g)",
              "calories": 0,
              "protein": 0,
              "carbs": 0,
              "fats": 0
            }
          ],
          "totalCalories": 0,
          "totalProtein": 0,
          "totalCarbs": 0,
          "totalFats": 0
        }
      ],
      "shoppingList": ["Item 1", "Item 2", ...],
      "dailyTotals": {
        "calories": 0,
        "protein": 0,
        "carbs": 0,
        "fats": 0
      }
    }`;

  try {
    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      parsed.day = new Date().toDateString(); // Set the day to the current date
      return parsed;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw error;
  }
};


