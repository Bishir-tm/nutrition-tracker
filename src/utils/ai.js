// src/utils/ai.js
import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const generateMealPlan = async (userData = {}) => {
  if (!API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file"
    );
  }

  const prompt = `Create a detailed one-day meal plan based on Nigerian cuisine.
    The user's data is as follows:
    - Daily calorie target: ${userData.dailyCalories || 2000} calories
    - Goal: ${userData.goal || "Maintain weight"}
    - Dietary restrictions: ${
      userData.dietaryRestrictions?.join(", ") || "None"
    }
    - Preferences: ${userData.preferences?.join(", ") || "None"}
    - Activity level: ${userData.activityLevel || "Sedentary"}

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
    }
    
    Return ONLY the JSON object, no markdown formatting or additional text.`;

  try {
    const ai = new GoogleGenAI({
      apiKey: API_KEY,
    });

    const model = "gemini-2.5-flash";
    console.log("Using model:", model);
    const contents = [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      contents,
    });

    let fullText = "";

    // Collect all chunks
    for await (const chunk of response) {
      console.log(chunk.text);
      if (chunk.text) {
        fullText += chunk.text;
      }
    }

    console.log("Raw AI response:", fullText);

    // Try to extract JSON from the response
    let jsonData;

    // First, try to parse the entire response as JSON
    try {
      jsonData = JSON.parse(fullText);
    } catch (e) {
      // If that fails, try to extract JSON from markdown code blocks
      const jsonMatch =
        fullText.match(/```json\n([\s\S]*?)\n```/) ||
        fullText.match(/```\n([\s\S]*?)\n```/) ||
        fullText.match(/{[\s\S]*}/);

      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        jsonData = JSON.parse(jsonString);
      } else {
        throw new Error("Could not extract valid JSON from response");
      }
    }

    // Set the day to the current date
    jsonData.day = new Date().toDateString();

    return jsonData;
  } catch (error) {
    console.error("Error generating meal plan:", error);

    // Return a fallback meal plan if API fails
    return getFallbackMealPlan(userData);
  }
};

// Fallback meal plan if API fails
const getFallbackMealPlan = (userData) => {
  return {
    day: new Date().toDateString(),
    meals: [
      {
        type: "breakfast",
        name: "Akara and Pap",
        foods: [
          {
            name: "Akara (Bean Cakes)",
            serving: "3 pieces",
            calories: 200,
            protein: 10,
            carbs: 20,
            fats: 8,
          },
          {
            name: "Pap (Ogi)",
            serving: "1 cup",
            calories: 150,
            protein: 2,
            carbs: 30,
            fats: 1,
          },
        ],
        totalCalories: 350,
        totalProtein: 12,
        totalCarbs: 50,
        totalFats: 9,
      },
      {
        type: "lunch",
        name: "Jollof Rice with Chicken",
        foods: [
          {
            name: "Jollof Rice",
            serving: "1.5 cups",
            calories: 400,
            protein: 8,
            carbs: 75,
            fats: 10,
          },
          {
            name: "Grilled Chicken",
            serving: "150g",
            calories: 250,
            protein: 35,
            carbs: 0,
            fats: 12,
          },
          {
            name: "Fried Plantain",
            serving: "1 medium",
            calories: 150,
            protein: 1,
            carbs: 35,
            fats: 5,
          },
        ],
        totalCalories: 800,
        totalProtein: 44,
        totalCarbs: 110,
        totalFats: 27,
      },
      {
        type: "snack",
        name: "Groundnuts and Banana",
        foods: [
          {
            name: "Roasted Groundnuts",
            serving: "30g",
            calories: 180,
            protein: 8,
            carbs: 6,
            fats: 14,
          },
          {
            name: "Banana",
            serving: "1 medium",
            calories: 105,
            protein: 1,
            carbs: 27,
            fats: 0,
          },
        ],
        totalCalories: 285,
        totalProtein: 9,
        totalCarbs: 33,
        totalFats: 14,
      },
      {
        type: "dinner",
        name: "Egusi Soup with Fufu",
        foods: [
          {
            name: "Egusi Soup",
            serving: "1 bowl",
            calories: 300,
            protein: 15,
            carbs: 10,
            fats: 25,
          },
          {
            name: "Fufu",
            serving: "1 wrap",
            calories: 200,
            protein: 2,
            carbs: 45,
            fats: 1,
          },
        ],
        totalCalories: 500,
        totalProtein: 17,
        totalCarbs: 55,
        totalFats: 26,
      },
    ],
    shoppingList: [
      "Black-eyed beans",
      "Cornmeal",
      "Rice",
      "Tomatoes",
      "Chicken",
      "Plantain",
      "Groundnuts",
      "Banana",
      "Egusi seeds",
      "Cassava flour",
      "Palm oil",
      "Onions",
      "Peppers",
    ],
    dailyTotals: {
      calories: 1935,
      protein: 82,
      carbs: 248,
      fats: 76,
    },
  };
};
