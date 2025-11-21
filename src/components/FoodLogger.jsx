// src/components/FoodLogger.jsx
import React, { useState } from "react";
import { Save, Camera, Upload, X } from "lucide-react";

const FoodLogger = ({ onFoodAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    servingSize: "100g",
    ingredients: "",
  });

  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [ocrError, setOcrError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a food name");
      return;
    }

    const foodItem = {
      ...formData,
      calories: parseFloat(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fats: parseFloat(formData.fats) || 0,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };

    onFoodAdded(foodItem);

    // Reset form
    setFormData({
      name: "",
      brand: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      servingSize: "100g",
      ingredients: "",
    });
    setUploadedImage(null);
  };

  const extractNutritionFromImage = async (file) => {
    try {
      setIsOCRProcessing(true);
      setOcrError("");

      // Create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // In a real implementation, you would call the Gemini API here
      // For now, we'll use a more realistic mock that simulates API delay

      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

      if (API_KEY) {
        // Real API call would go here
        // For demonstration, showing the structure:
        /*
        const base64Image = await fileToBase64(file);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: "Extract nutrition information from this label. Provide: name, brand, calories, protein (g), carbs (g), fats (g), serving size. Return as JSON." },
                  { inline_data: { mime_type: file.type, data: base64Image } }
                ]
              }]
            })
          }
        );
        const data = await response.json();
        // Parse and extract nutrition data
        */
      }

      // Mock extraction with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate extracted data
      const mockExtraction = {
        name: "Nutrition Product",
        brand: "Brand Name",
        calories: "150",
        protein: "12",
        carbs: "20",
        fats: "3",
        servingSize: "100g",
      };

      setFormData((prev) => ({
        ...prev,
        ...mockExtraction,
      }));

      setIsOCRProcessing(false);
    } catch (error) {
      console.error("OCR Error:", error);
      setOcrError(
        "Failed to extract nutrition information. Please enter manually."
      );
      setIsOCRProcessing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setOcrError("Please upload a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setOcrError("Image size should be less than 5MB");
      return;
    }

    await extractNutritionFromImage(file);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result?.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Add Food Manually</h2>
        <p className="text-gray-600">Enter food nutrition information</p>
      </div>

      {/* OCR Upload Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          📸 AI Nutrition Label Scan
        </h3>
        <p className="text-blue-700 text-sm mb-3">
          Take a photo of a nutrition label and we'll extract the data
          automatically
        </p>

        {uploadedImage && (
          <div className="mb-3 relative">
            <img
              src={uploadedImage}
              alt="Uploaded nutrition label"
              className="w-full h-48 object-contain bg-white rounded border"
            />
            <button
              onClick={() => {
                setUploadedImage(null);
                setOcrError("");
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {ocrError && (
          <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
            {ocrError}
          </div>
        )}

        <label className="flex items-center justify-center space-x-2 bg-white border-2 border-blue-300 border-dashed rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors">
          <Upload className="w-5 h-5 text-blue-600" />
          <span className="text-blue-700 font-medium">
            {isOCRProcessing ? "Processing Image..." : "Upload Nutrition Label"}
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isOCRProcessing}
          />
        </label>

        {isOCRProcessing && (
          <div className="mt-3 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-blue-700 text-sm">
              Extracting nutrition data...
            </span>
          </div>
        )}
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
              min="0"
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
              min="0"
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
              min="0"
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
              min="0"
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
