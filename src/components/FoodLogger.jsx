// src/components/FoodLogger.js
import React, { useState } from 'react';
import { Save, Camera, Upload } from 'lucide-react';

const FoodLogger = ({ onFoodAdded }) => {
const [formData, setFormData] = useState({
name: '',
brand: '',
calories: '',
protein: '',
carbs: '',
fats: '',
servingSize: '100g',
ingredients: ''
});

const [isOCRProcessing, setIsOCRProcessing] = useState(false);

const handleChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({
...prev,
[name]: value
}));
};

const handleSubmit = (e) => {
e.preventDefault();
const foodItem = {
...formData,
calories: parseFloat(formData.calories) || 0,
protein: parseFloat(formData.protein) || 0,
carbs: parseFloat(formData.carbs) || 0,
fats: parseFloat(formData.fats) || 0,
id: Date.now(),
timestamp: new Date().toISOString()
};
onFoodAdded(foodItem);
// Reset form
setFormData({
name: '',
brand: '',
calories: '',
protein: '',
carbs: '',
fats: '',
servingSize: '100g',
ingredients: ''
});
};

const handleImageUpload = async (e) => {
const file = e.target.files[0];
if (!file) return;

    setIsOCRProcessing(true);

    // Simulate OCR processing (in real app, this would call Gemini AI)
    setTimeout(() => {
      // Mock AI extraction results
      const mockExtraction = {
        name: 'Greek Yogurt',
        brand: 'Brand Name',
        calories: '120',
        protein: '23',
        carbs: '5',
        fats: '0',
        servingSize: '170g'
      };

      setFormData(prev => ({
        ...prev,
        ...mockExtraction
      }));
      setIsOCRProcessing(false);
    }, 2000);

};

return (
<div className="space-y-6">
<div className="text-center">
<h2 className="text-xl font-bold text-gray-900">Add Food Manually</h2>
<p className="text-gray-600">Enter food nutrition information</p>
</div>

      {/* OCR Upload Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">AI Nutrition Label Scan</h3>
        <p className="text-blue-700 text-sm mb-3">
          Take a photo of a nutrition label and we'll extract the data automatically
        </p>
        <label className="flex items-center justify-center space-x-2 bg-white border-2 border-blue-300 border-dashed rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-5 h-5 text-blue-600" />
          <span className="text-blue-700 font-medium">
            {isOCRProcessing ? 'Processing Image...' : 'Upload Nutrition Label'}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isOCRProcessing}
          />
        </label>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Food Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="e.g., Apple"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="e.g., Chobani"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serving Size
          </label>
          <input
            type="text"
            name="servingSize"
            value={formData.servingSize}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="e.g., 1 cup, 100g"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calories
            </label>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              step="0.1"
              name="protein"
              value={formData.protein}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carbs (g)
            </label>
            <input
              type="number"
              step="0.1"
              name="carbs"
              value={formData.carbs}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fats (g)
            </label>
            <input
              type="number"
              step="0.1"
              name="fats"
              value={formData.fats}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingredients (Optional)
          </label>
          <textarea
            name="ingredients"
            value={formData.ingredients}
            onChange={handleChange}
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="List of ingredients..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>Add to Today's Log</span>
        </button>
      </form>
    </div>

);
};

export default FoodLogger;