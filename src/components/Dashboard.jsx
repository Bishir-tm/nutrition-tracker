// src/components/Dashboard.js
import React from 'react';
import { Plus, Target, Utensils, Activity } from 'lucide-react';

const Dashboard = ({ userData, dailyLog, onAddFood }) => {
const calculateTotals = () => {
return dailyLog.reduce((totals, item) => ({
calories: totals.calories + (item.calories || 0),
protein: totals.protein + (item.protein || 0),
carbs: totals.carbs + (item.carbs || 0),
fats: totals.fats + (item.fats || 0)
}), { calories: 0, protein: 0, carbs: 0, fats: 0 });
};

const totals = calculateTotals();
const remainingCalories = Math.max(0, (userData?.dailyCalories || 2000) - totals.calories);

const ProgressRing = ({ progress, color, label, value, max }) => {
const circumference = 2 * Math.PI * 45;
const strokeDasharray = circumference;
const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r="45"
              stroke={color}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-900">{value}</span>
          </div>
        </div>
        <span className="text-sm text-gray-600 mt-2">{label}</span>
      </div>
    );

};

return (
<div className="space-y-6">
{/* Header */}
<div className="text-center">
<h1 className="text-2xl font-bold text-gray-900">Nutrition Tracker</h1>
<p className="text-gray-600">Today's Progress</p>
</div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{remainingCalories}</div>
          <div className="text-sm text-gray-600">Calories Left</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
          <Utensils className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{dailyLog.length}</div>
          <div className="text-sm text-gray-600">Foods Logged</div>
        </div>
      </div>

      {/* Progress Rings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Daily Progress</h2>
        <div className="grid grid-cols-2 gap-4">
          <ProgressRing
            progress={(totals.calories / (userData?.dailyCalories || 2000)) * 100}
            color="#3b82f6"
            label="Calories"
            value={totals.calories}
            max={userData?.dailyCalories || 2000}
          />
          <ProgressRing
            progress={(totals.protein / 100) * 100}
            color="#10b981"
            label="Protein (g)"
            value={totals.protein.toFixed(1)}
            max={100}
          />
        </div>
      </div>

      {/* Macro Breakdown */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Macros</h2>
        <div className="space-y-3">
          <MacroBar label="Protein" value={totals.protein} color="bg-green-500" max={100} />
          <MacroBar label="Carbs" value={totals.carbs} color="bg-blue-500" max={300} />
          <MacroBar label="Fats" value={totals.fats} color="bg-yellow-500" max={70} />
        </div>
      </div>

      {/* Quick Actions */}
      <button
        onClick={onAddFood}
        className="w-full bg-black text-white py-4 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Add Food</span>
      </button>
    </div>

);
};

const MacroBar = ({ label, value, color, max }) => {
const percentage = Math.min((value / max) * 100, 100);

return (
<div>
<div className="flex justify-between text-sm mb-1">
<span className="text-gray-700">{label}</span>
<span className="text-gray-900 font-medium">{value.toFixed(1)}g</span>
</div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div
className={`h-2 rounded-full ${color} transition-all duration-300`}
style={{ width: `${percentage}%` }} ></div>
</div>
</div>
);
};

export default Dashboard;