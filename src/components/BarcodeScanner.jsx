// src/components/BarcodeScanner.jsx
import React, { useState } from "react";
import { useZxing } from "react-zxing";
import { Camera, X, Utensils, AlertCircle, CheckCircle } from "lucide-react";
import { searchOpenFoodFacts } from "../utils/storage";

const BarcodeScanner = ({ onFoodScanned, onManualEntry }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");

  const { ref } = useZxing({
    onDecodeResult(result) {
      const code = result.getText();
      console.log("✅ Barcode detected:", code);

      // Prevent duplicate scans
      if (code && code !== lastScannedCode) {
        setLastScannedCode(code);
        handleBarcodeScanned(code);
      }
    },
    onError(error) {
      console.log("Scanner error:", error);
    },
    paused: isLoading || scanResult !== null,
    constraints: {
      video: {
        facingMode: "environment", // Use back camera on mobile
      },
    },
  });

  const handleBarcodeScanned = async (barcode) => {
    console.log("🔍 Processing barcode:", barcode);
    setIsLoading(true);
    setError("");

    try {
      const product = await searchOpenFoodFacts(barcode);
      console.log("✅ Product found:", product);
      setScanResult(product);
    } catch (err) {
      console.error("❌ Product lookup error:", err);
      setError(
        `Product not found (Code: ${barcode}). The product may not be in the database. Try manual entry.`
      );
      setLastScannedCode(""); // Allow rescanning
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = () => {
    if (scanResult) {
      console.log("✅ Adding food to log:", scanResult);
      onFoodScanned(scanResult);
    }
  };

  const handleTryAgain = () => {
    console.log("🔄 Resetting scanner");
    setError("");
    setScanResult(null);
    setLastScannedCode("");
  };

  const handleManualScan = () => {
    const code = prompt("Enter barcode number manually:");
    if (code && code.trim()) {
      console.log("⌨️ Manual barcode entry:", code);
      handleBarcodeScanned(code.trim());
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

      {/* Scanner Video */}
      {!scanResult && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={ref}
            className="w-full h-auto"
            style={{ minHeight: "300px" }}
          />

          {/* Scanner Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 border-4 border-white rounded-lg shadow-lg">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
            </div>
          </div>

          {/* Scanning Indicator */}
          {!isLoading && !error && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-full flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Scanning...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!scanResult && !error && !isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-900 font-medium">
                Align the barcode within the frame
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1">
                <li>• Make sure there's good lighting</li>
                <li>• Hold steady and keep barcode in focus</li>
                <li>• The scanner detects automatically</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-2">Looking up product...</p>
          <p className="text-gray-500 text-sm mt-1">Code: {lastScannedCode}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3 mb-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 flex-1 text-sm">{error}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTryAgain}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
            >
              Try Again
            </button>
            <button
              onClick={onManualEntry}
              className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
            >
              Manual Entry
            </button>
          </div>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && !isLoading && (
        <div className="bg-white border-2 border-green-500 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-semibold text-lg text-gray-900">
                Product Found!
              </h3>
            </div>
            <button
              onClick={handleTryAgain}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Product Name</div>
              <div className="font-semibold text-gray-900">
                {scanResult.name}
              </div>
            </div>

            {scanResult.brand && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Brand</div>
                <div className="font-semibold text-gray-900">
                  {scanResult.brand}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Calories</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(scanResult.calories) || 0}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Protein</div>
                <div className="text-2xl font-bold text-gray-900">
                  {scanResult.protein?.toFixed(1) || 0}
                  <span className="text-sm ml-1">g</span>
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Carbs</div>
                <div className="text-2xl font-bold text-gray-900">
                  {scanResult.carbs?.toFixed(1) || 0}
                  <span className="text-sm ml-1">g</span>
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Fats</div>
                <div className="text-2xl font-bold text-gray-900">
                  {scanResult.fats?.toFixed(1) || 0}
                  <span className="text-sm ml-1">g</span>
                </div>
              </div>
            </div>

            {scanResult.servingSize && (
              <div className="text-sm text-gray-600 text-center">
                Per {scanResult.servingSize}
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleAddFood}
              className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Add to Log</span>
            </button>
            <button
              onClick={handleTryAgain}
              className="px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!scanResult && !isLoading && (
        <div className="space-y-3">
          <button
            onClick={handleManualScan}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:border-gray-400 transition-colors"
          >
            <span>📝</span>
            <span>Enter Barcode Manually</span>
          </button>

          <button
            onClick={onManualEntry}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:border-gray-400 transition-colors"
          >
            <Utensils className="w-5 h-5" />
            <span>Enter Food Details</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
