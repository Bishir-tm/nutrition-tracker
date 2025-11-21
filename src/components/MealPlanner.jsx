// src/components/MealPlanner.js
import React, { useState } from 'react';
import { Utensils, ShoppingCart, Plus, ChefHat } from 'lucide-react';

const MealPlanner = ({ userData }) => {
const [mealPlan, setMealPlan] = useState(null);
const [isGenerating, setIsGenerating] = useState(false);

const generateMealPlan = async () => {
setIsGenerating(true);

    // Simulate AI meal plan generation
    setTimeout(() => {
      const mockMealPlan = {
        day: new Date().toDateString(),
        meals: [
          {
            type: 'breakfast',
            name: 'Protein Oatmeal with Berries',
            foods: [
              { name: 'Oats', serving: '1/2 cup', calories: 150, protein: 5, carbs: 27, fats: 3 },
              { name: 'Protein Powder', serving: '1 scoop', calories: 120, protein: 24, carbs: 3, fats: 1 },
              { name: 'Mixed Berries', serving: '1 cup', calories: 80, protein: 1, carbs: 20, fats: 0 }
            ],
            totalCalories: 350,
            totalProtein: 30,
            totalCarbs: 50,
            totalFats: 4
          },
          {
            type: 'lunch',
            name: 'Grilled Chicken Salad',
            foods: [
              { name: 'Chicken Breast', serving: '150g', calories: 165, protein: 31, carbs: 0, fats: 3.6 },
              { name: 'Mixed Greens', serving: '2 cups', calories: 20, protein: 1, carbs: 4, fats: 0 },
              { name: 'Olive Oil Dressing', serving: '1 tbsp', calories: 120, protein: 0, carbs: 0, fats: 14 }
            ],
            totalCalories: 305,
            totalProtein: 32,
            totalCarbs: 4,
            totalFats: 17.6
          },
          {
            type: 'dinner',
            name: 'Salmon with Quinoa & Veggies',
            foods: [
              { name: 'Salmon Fillet', serving: '200g', calories: 412, protein: 40, carbs: 0, fats: 26 },
              { name: 'Quinoa', serving: '1 cup cooked', calories: 222, protein: 8, carbs: 39, fats: 3.5 },
              { name: 'Steamed Broccoli', serving: '1 cup', calories: 55, protein: 4, carbs: 11, fats: 1 }
            ],
            totalCalories: 689,
            totalProtein: 52,
            totalCarbs: 50,
            totalFats: 30.5
          },
          {
            type: 'snack',
            name: 'Greek Yogurt with Nuts',
            foods: [
              { name: 'Greek Yogurt', serving: '170g', calories: 100, protein: 18, carbs: 6, fats: 0 },
              { name: 'Almonds', serving: '1/4 cup', calories: 205, protein: 7, carbs: 7, fats: 18 }
            ],
            totalCalories: 305,
            totalProtein: 25,
            totalCarbs: 13,
            totalFats: 18
          }
        ],
        shoppingList: [
          'Oats', 'Protein Powder', 'Mixed Berries', 'Chicken Breast',
          'Mixed Greens', 'Olive Oil', 'Salmon Fillet', 'Quinoa',
          'Broccoli', 'Greek Yogurt', 'Almonds'
        ],
        dailyTotals: {
          calories: 1649,
          protein: 139,
          carbs: 117,
          fats: 70.1
        }
      };

      setMealPlan(mockMealPlan);
      setIsGenerating(false);
    }, 2000);

};

if (!mealPlan) {
return (
<div className="space-y-6">
<div className="text-center">
<Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
<h2 className="text-2xl font-bold text-gray-900">AI Meal Planner</h2>
<p className="text-gray-600">Get personalized meal plans based on your goals</p>
</div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <ChefHat className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Ready to Generate Your Plan?</h3>
            <p className="text-gray-600 text-sm">
              Based on your profile: {userData?.dailyCalories} calories, {userData?.goal} goal
            </p>
          </div>

          <button
            onClick={generateMealPlan}
            disabled={isGenerating}
            className="w-full bg-black text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Utensils className="w-5 h-5" />
            )}
            <span>{isGenerating ? 'Generating...' : 'Generate Meal Plan'}</span>
          </button>
        </div>
      </div>
    );

}

return (
<div className="space-y-6">
<div className="text-center">
<h2 className="text-2xl font-bold text-gray-900">Your Meal Plan</h2>
<p className="text-gray-600">Generated for {mealPlan.day}</p>
</div>

      {/* Daily Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Daily Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Total Calories</div>
            <div className="font-semibold text-lg">{mealPlan.dailyTotals.calories}</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Protein</div>
            <div className="font-semibold text-lg">{mealPlan.dailyTotals.protein}g</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Carbs</div>
            <div className="font-semibold text-lg">{mealPlan.dailyTotals.carbs}g</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-gray-600">Fats</div>
            <div className="font-semibold text-lg">{mealPlan.dailyTotals.fats}g</div>
          </div>
        </div>
      </div>

      {/* Meals */}
      <div className="space-y-4">
        {mealPlan.meals.map((meal, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">{meal.type}</h3>
                <p className="text-gray-600">{meal.name}</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{meal.totalCalories} cal</div>
                <div className="text-sm text-gray-600">
                  P:{meal.totalProtein}g C:{meal.totalCarbs}g F:{meal.totalFats}g
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {meal.foods.map((food, foodIndex) => (
                <div key={foodIndex} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="text-gray-700">{food.name}</span>
                    <span className="text-gray-500 text-xs ml-2">({food.serving})</span>
                  </div>
                  <div className="text-gray-900">
                    {food.calories} cal
                  </div>
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
            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={generateMealPlan}
        className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:border-gray-400 transition-colors"
      >
        <Utensils className="w-5 h-5" />
        <span>Generate New Plan</span>
      </button>
    </div>

);
};

export default MealPlanner;