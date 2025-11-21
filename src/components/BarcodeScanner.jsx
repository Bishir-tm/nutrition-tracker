// src/components/BarcodeScanner.js
import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, X, Utensils } from "lucide-react";
import { searchOpenFoodFacts } from "../utils/storage";

const BarcodeScanner = ({ onFoodScanned, onManualEntry }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result) {
      scanner.clear();
      handleBarcodeScanned(result);
    }

    function error(err) {
      // console.log('Scanner error:', err);
    }

    return () => {
      scanner.clear();
    };
  }, []);

  const handleBarcodeScanned = async (barcode) => {
    setIsLoading(true);
    setError("");

    try {
      const product = await searchOpenFoodFacts(barcode);
      setScanResult(product);
    } catch (err) {
      setError(
        "Product not found. Try manual entry or take a photo of the nutrition label."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = () => {
    if (scanResult) {
      onFoodScanned(scanResult);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Scan Barcode</h2>
        <p className="text-gray-600">
          Point your camera at the product barcode
        </p>
      </div>

      {/* Scanner Container */}
      <div className="bg-[#afafaf] rounded-lg overflow-hidden">
        <div id="reader" className="w-full"></div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-2">Searching database...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={onManualEntry}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Manual Entry
            </button>
            <button
              onClick={() => setError("")}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">Product Found</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{scanResult.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Brand:</span>
              <span className="ml-2 text-gray-900">{scanResult.brand}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Calories:</span>
                <div className="font-semibold">{scanResult.calories || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Protein:</span>
                <div className="font-semibold">{scanResult.protein || 0}g</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Carbs:</span>
                <div className="font-semibold">{scanResult.carbs || 0}g</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <span className="text-gray-600">Fats:</span>
                <div className="font-semibold">{scanResult.fats || 0}g</div>
              </div>
            </div>
          </div>
          <button
            onClick={handleAddFood}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Add to Today's Log
          </button>
        </div>
      )}

      {/* Manual Entry Fallback */}
      <button
        onClick={onManualEntry}
        className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:border-gray-400 transition-colors"
      >
        <Utensils className="w-5 h-5" />
        <span>Enter Food Manually</span>
      </button>
    </div>
  );
};

export default BarcodeScanner;
