// src/utils/ai.js
// We'll use the Gemini API. Make sure to set up your API key in the environment variable.

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const generateMealPlan = async (userData) => {
  // If no API key, return a mock meal plan
  if (!API_KEY) {
    return getMockMealPlan(userData);
  }

  const prompt = `Create a detailed meal plan for a day with the following requirements: - Daily calorie target: ${
    userData.dailyCalories
  } calories - Goal: ${userData.goal} - Dietary restrictions: ${
    userData.dietaryRestrictions.join(", ") || "None"
  } - Preferences: ${
    userData.preferences.join(", ") || "None"
  } - Activity level: ${userData.activityLevel}

    Please provide the response in the following JSON format:
    {
      "meals": [
        {
          "name": "Meal name",
          "time": "Breakfast/Lunch/Dinner/Snack",
          "foods": [
            {
              "name": "Food item",
              "servingSize": "Serving size",
              "calories": 0,
              "protein": 0,
              "carbs": 0,
              "fats": 0
            }
          ]
        }
      ],
      "shoppingList": ["Item 1", "Item 2", ...]
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
      return JSON.parse(jsonMatch[1]);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return getMockMealPlan(userData);
  }
};

const getMockMealPlan = (userData) => {
  // Return a mock meal plan based on user data
  return {
    meals: [
      {
        name: "Scrambled Eggs with Avocado",
        time: "Breakfast",
        foods: [
          {
            name: "Eggs",
            servingSize: "2 large",
            calories: 180,
            protein: 12,
            carbs: 2,
            fats: 14,
          },
          {
            name: "Avocado",
            servingSize: "1/2 medium",
            calories: 160,
            protein: 2,
            carbs: 8,
            fats: 15,
          },
        ],
      },
      {
        name: "Grilled Chicken Salad",
        time: "Lunch",
        foods: [
          {
            name: "Chicken Breast",
            servingSize: "150g",
            calories: 165,
            protein: 31,
            carbs: 0,
            fats: 3.6,
          },
          {
            name: "Mixed Greens",
            servingSize: "2 cups",
            calories: 20,
            protein: 1,
            carbs: 4,
            fats: 0,
          },
        ],
      },
      {
        name: "Salmon with Quinoa",
        time: "Dinner",
        foods: [
          {
            name: "Salmon",
            servingSize: "200g",
            calories: 412,
            protein: 40,
            carbs: 0,
            fats: 26,
          },
          {
            name: "Quinoa",
            servingSize: "1 cup cooked",
            calories: 222,
            protein: 8,
            carbs: 39,
            fats: 3.5,
          },
        ],
      },
    ],
    shoppingList: [
      "Eggs",
      "Avocado",
      "Chicken Breast",
      "Mixed Greens",
      "Salmon",
      "Quinoa",
    ],
  };
};
