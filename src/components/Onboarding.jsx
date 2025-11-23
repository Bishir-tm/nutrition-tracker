// src/components/Onboarding.js
import React, { useState } from "react";
import { ArrowRight, User, Target, Activity, Utensils } from "lucide-react";

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    age: "",
    weight: "",
    height: "",
    activityLevel: "moderate",
    goal: "maintain",
    dietaryRestrictions: [],
    preferences: [],
    dailyCalories: 2000,
  });

  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little to no exercise)" },
    { value: "light", label: "Light (exercise 1-3 times/week)" },
    { value: "moderate", label: "Moderate (exercise 3-5 times/week)" },
    { value: "active", label: "Active (exercise 6-7 times/week)" },
    { value: "very_active", label: "Very Active (physical job + exercise)" },
  ];

  const goals = [
    { value: "loss", label: "Weight Loss", icon: "📉" },
    { value: "maintain", label: "Maintain Weight", icon: "⚖️" },
    { value: "gain", label: "Muscle Gain", icon: "💪" },
  ];

  const dietaryRestrictions = [
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten_free", label: "Gluten-Free" },
    { value: "dairy_free", label: "Dairy-Free" },
    { value: "halal", label: "Halal" },
    { value: "kosher", label: "Kosher" },
  ];

  const preferences = [
    { value: "quick_meals", label: "Quick & Easy Meals" },
    { value: "african", label: "African Cuisine" },
    { value: "asian", label: "Asian Cuisine" },
    { value: "mediterranean", label: "Mediterranean" },
    { value: "low_carb", label: "Low Carb" },
    { value: "high_protein", label: "High Protein" },
  ];

  const calculateCalories = () => {
    // Simple Mifflin-St Jeor calculation
    const weight = parseFloat(userData.weight) || 70;
    const height = parseFloat(userData.height) || 170;
    const age = parseFloat(userData.age) || 30;

    let bmr = 10 * weight + 6.25 * height - 5 * age + 5; // Male calculation

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    let calories = bmr * (activityMultipliers[userData.activityLevel] || 1.55);

    // Adjust for goal
    if (userData.goal === "loss") calories -= 500;
    if (userData.goal === "gain") calories += 500;

    return Math.round(calories);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      const finalData = {
        ...userData,
        dailyCalories: calculateCalories(),
      };
      onComplete(finalData);
    }
  };

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelect = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Info
              </h2>
              <p className="text-gray-600">Tell us about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={userData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={userData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your weight"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={userData.height}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Enter your height"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                Activity Level
              </h2>
              <p className="text-gray-600">How active are you?</p>
            </div>

            <div className="space-y-3">
              {activityLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() =>
                    handleInputChange("activityLevel", level.value)
                  }
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    userData.activityLevel === level.value
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Your Goal</h2>
              <p className="text-gray-600">What do you want to achieve?</p>
            </div>

            <div className="grid gap-3">
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => handleInputChange("goal", goal.value)}
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    userData.goal === goal.value
                      ? "border-black bg-black text-white"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {/* <div className="text-2xl mb-2">{goal.icon}</div> */}
                  <div className="font-semibold">{goal.label}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                Diet & Preferences
              </h2>
              <p className="text-gray-600">Customize your experience</p>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Dietary Restrictions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryRestrictions.map((restriction) => (
                    <button
                      key={restriction.value}
                      onClick={() =>
                        handleMultiSelect(
                          "dietaryRestrictions",
                          restriction.value
                        )
                      }
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        userData.dietaryRestrictions.includes(restriction.value)
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {restriction.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Food Preferences
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {preferences.map((preference) => (
                    <button
                      key={preference.value}
                      onClick={() =>
                        handleMultiSelect("preferences", preference.value)
                      }
                      className={`p-3 border rounded-lg text-sm transition-colors ${
                        userData.preferences.includes(preference.value)
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {preference.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {step} of 4</span>
            <span>{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation */}
        <button
          onClick={handleNext}
          className="w-full mt-8 bg-black text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
        >
          <span>{step === 4 ? "Complete Setup" : "Continue"}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
