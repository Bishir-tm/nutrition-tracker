import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userData } = req.body;
    const API_KEY = process.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("API key not configured");
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

    const ai = new GoogleGenAI({
      apiKey: API_KEY,
    });

    const model = "gemini-2.5-flash";
    const contents = [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ];

    const response = await ai.models.generateContentStream({
      model,
      contents,
    });

    let fullText = "";

    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
      }
    }

    let jsonData;

    try {
      jsonData = JSON.parse(fullText);
    } catch (e) {
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

    jsonData.day = new Date().toDateString();

    res.status(200).json(jsonData);
  } catch (error) {
    console.error("Error generating meal plan:", error);
    res.status(500).json({
      error: error.message,
      fallback: getFallbackMealPlan(),
    });
  }
}

const getFallbackMealPlan = () => {
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
