// src/components/FoodLogger.jsx
import React, { useState } from "react";
import { Save, Upload, X, AlertCircle } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

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
    setOcrError("");
  };

  const extractNutritionFromImage = async (file) => {
    try {
      setIsOCRProcessing(true);
      setOcrError("");

      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      const API_URL =
        import.meta.env.VITE_API_URL ||
        "https://nutrition-tracker-backend-h4yi2sxzh-bitmo24-gmailcoms-projects.vercel.app/api";

      // Helper function to parse nutrition from text
      const parseNutritionFromText = (text) => {
        const normalize = (s) => (s || "").replace(/\u00A0/g, " ");
        const t = normalize(text).toLowerCase();
        const findNumber = (rx) => {
          const m = t.match(rx);
          if (!m) return null;
          const num = m[1].replace(/[^\d.]/g, "");
          return num ? parseFloat(num) : null;
        };

        const calories =
          findNumber(/calories[:\s]*([\d.,]+\s?k?cal)/i) ||
          findNumber(/energy[:\s]*([\d.,]+)/i) ||
          findNumber(/(\d{2,4})\s?k?cal/i) ||
          null;
        const protein = findNumber(/protein[:\s]*([\d.,]+)\s?g/i) || null;
        const carbs =
          findNumber(/carbohydrates[:\s]*([\d.,]+)\s?g/i) ||
          findNumber(/carbs[:\s]*([\d.,]+)\s?g/i) ||
          null;
        const fats =
          findNumber(/fat[:\s]*([\d.,]+)\s?g/i) ||
          findNumber(/fats[:\s]*([\d.,]+)\s?g/i) ||
          null;
        const servingMatch = t.match(/serving[:\s]*([^\n\r,]+)/i);
        const servingSize = servingMatch ? servingMatch[1].trim() : null;

        const lines = text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        const name = lines.length ? lines[0].slice(0, 120) : null;
        const brand =
          lines.length > 1 && lines[1].length < 40 ? lines[1] : null;

        return {
          name: name || "",
          brand: brand || "",
          calories: calories !== null ? String(calories) : "",
          protein: protein !== null ? String(protein) : "",
          carbs: carbs !== null ? String(carbs) : "",
          fats: fats !== null ? String(fats) : "",
          servingSize: servingSize || "100g",
        };
      };

      // Try backend API first
      try {
        const base64Image = await fileToBase64(file);

        const response = await fetch(`${API_URL}/nutrition-ocr`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base64Image,
            mimeType: file.type,
          }),
        });

        if (response.ok) {
          const data = await response.json();

          let parsedData;
          if (data.rawText) {
            parsedData = parseNutritionFromText(data.rawText);
          } else {
            parsedData = data;
          }

          setFormData((prev) => ({
            ...prev,
            name: parsedData.name || prev.name,
            brand: parsedData.brand || prev.brand,
            calories: parsedData.calories || prev.calories,
            protein: parsedData.protein || prev.protein,
            carbs: parsedData.carbs || prev.carbs,
            fats: parsedData.fats || prev.fats,
            servingSize: parsedData.servingSize || prev.servingSize,
          }));

          setIsOCRProcessing(false);
          URL.revokeObjectURL(imageUrl);
          return;
        }
      } catch (apiErr) {
        console.warn("Backend API attempt failed, falling back to local OCR");
      }

      // Fallback to local OCR with tesseract.js
      try {
        const { data } = await Tesseract.recognize(file, "eng");
        const extracted = data?.text || "";
        const parsed = parseNutritionFromText(extracted);
        setFormData((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          brand: parsed.brand || prev.brand,
          calories: parsed.calories || prev.calories,
          protein: parsed.protein || prev.protein,
          carbs: parsed.carbs || prev.carbs,
          fats: parsed.fats || prev.fats,
          servingSize: parsed.servingSize || prev.servingSize,
        }));
        setIsOCRProcessing(false);
        URL.revokeObjectURL(imageUrl);
      } catch (ocrErr) {
        console.error("Local OCR failed:", ocrErr);
        setOcrError(
          "Failed to extract nutrition information. Please enter manually."
        );
        setIsOCRProcessing(false);
        URL.revokeObjectURL(imageUrl);
      }
    } catch (error) {
      console.error("OCR/Error:", error);
      setOcrError(
        "Failed to extract nutrition information. Please enter manually."
      );
      setIsOCRProcessing(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous error
    setOcrError("");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setOcrError("Please upload a valid image file (JPG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setOcrError(
        "Image size should be less than 5MB. Please use a smaller image."
      );
      return;
    }

    await extractNutritionFromImage(file);
  };

  const handleClearImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
    }
    setUploadedImage(null);
    setOcrError("");
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
          Nutrition Label Scan
        </h3>
        <p className="text-blue-700 text-sm mb-3">
          Take a photo of a nutrition label and get an extract of the data
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
              onClick={handleClearImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              disabled={isOCRProcessing}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {ocrError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 text-sm font-medium mb-1">
                  Error Processing Image
                </p>
                <p className="text-red-700 text-sm">{ocrError}</p>
              </div>
            </div>
          </div>
        )}

        <label
          className={`flex items-center justify-center space-x-2 bg-white border-2 border-blue-300 border-dashed rounded-lg p-4 transition-colors ${
            isOCRProcessing
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-blue-400"
          }`}
        >
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
              Analyzing image with AI...
            </span>
          </div>
        )}

        <div className="mt-3 text-xs text-blue-600">
          Tip: Make sure the nutrition label is clearly visible and well-lit for
          best results
        </div>
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
