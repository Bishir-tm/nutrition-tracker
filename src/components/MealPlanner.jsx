// src/components/MealPlanner.jsx
import React, { useState, useEffect } from "react";
import { Utensils, ShoppingCart, Plus, ChefHat } from "lucide-react";

import { generateMealPlan as generateMealPlanFromAI } from "../utils/ai";

const MealPlanner = ({ userData }) => {
  const [mealPlan, setMealPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const savedMealPlan = localStorage.getItem("mealPlan");
    if (savedMealPlan) {
      setMealPlan(JSON.parse(savedMealPlan));
    }
  }, []);

  const generateMealPlan = async () => {
    setIsGenerating(true);

    // Clear the old meal plan immediately
    setMealPlan(null);
    localStorage.removeItem("mealPlan");

    try {
      const newMealPlan = await generateMealPlanFromAI(userData);
      setMealPlan(newMealPlan);
      localStorage.setItem("mealPlan", JSON.stringify(newMealPlan));
    } catch (error) {
      console.error("Failed to generate meal plan:", error);
      // Show an error message to the user
      alert("Failed to generate meal plan. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mealPlan) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">AI Meal Planner</h2>
          <p className="text-gray-600">
            Get personalized meal plans based on your goals
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <ChefHat className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">
              Ready to Generate Your Plan?
            </h3>
            <p className="text-gray-600 text-sm">
              Based on your profile: {userData?.dailyCalories} calories,{" "}
              {userData?.goal} goal
            </p>
          </div>

          <button
            onClick={generateMealPlan}
            disabled={isGenerating}
            className="w-full bg-black text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Utensils className="w-5 h-5" />
                <span>Generate Meal Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-gray-900">Your Meal Plan</h2>
        <p className="text-gray-600">Generated for {mealPlan.day}</p>
      </div>

      {/* Daily Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Daily Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Total Calories</div>
            <div className="font-semibold text-lg">
              {mealPlan.dailyTotals.calories}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Protein</div>
            <div className="font-semibold text-lg">
              {mealPlan.dailyTotals.protein}g
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Carbs</div>
            <div className="font-semibold text-lg">
              {mealPlan.dailyTotals.carbs}g
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Fats</div>
            <div className="font-semibold text-lg">
              {mealPlan.dailyTotals.fats}g
            </div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {mealPlan.meals.map((meal, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">
                  {meal.type}
                </h3>
                <p className="text-gray-600">{meal.name}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {meal.totalCalories} cal
                </div>
                <div className="text-sm text-gray-600">
                  P:{meal.totalProtein}g C:{meal.totalCarbs}g F:{meal.totalFats}
                  g
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {meal.foods.map((food, foodIndex) => (
                <div
                  key={foodIndex}
                  className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="text-gray-700">{food.name}</span>
                    <span className="text-gray-500 text-xs ml-2">
                      ({food.serving})
                    </span>
                  </div>
                  <div className="text-gray-900">{food.calories} cal</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Shopping List */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Shopping List
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {mealPlan.shoppingList.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
            >
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={generateMealPlan}
        disabled={isGenerating}
        className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
            <span>Generating New Plan...</span>
          </>
        ) : (
          <>
            <Utensils className="w-5 h-5" />
            <span>Generate New Plan</span>
          </>
        )}
      </button>
    </div>
  );
};

export default MealPlanner;
