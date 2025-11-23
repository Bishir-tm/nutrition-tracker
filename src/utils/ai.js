// src/utils/ai.js

const API_URL =
  import.meta.env.VITE_API_URL ||
  "ttps://nutrition-tracker-backend-h4yi2sxzh-bitmo24-gmailcoms-projects.vercel.app/api";

export const generateMealPlan = async (userData = {}) => {
  try {
    const response = await fetch(`${API_URL}/meal-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.fallback) {
        return errorData.fallback;
      }
      throw new Error("Failed to generate meal plan");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating meal plan:", error);
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
