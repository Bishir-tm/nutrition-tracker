// src/components/BarcodeScanner.jsx
import React, { useState, useEffect } from "react";
import { useZxing } from "react-zxing";
import { Camera, X, Utensils, AlertCircle, CheckCircle } from "lucide-react";
import { searchOpenFoodFacts } from "../utils/storage";

const BarcodeScanner = ({ onFoodScanned, onManualEntry }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [hasPermission, setHasPermission] = useState(false);
  const [editedData, setEditedData] = useState(null);

  // Request camera permission on mount
  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Permission granted, stop the test stream
      stream.getTracks().forEach((track) => track.stop());
      setHasPermission(true);
      setCameraError("");
    } catch (err) {
      console.error("Camera permission error:", err);
      setCameraError(
        "Camera access denied. Please enable camera permissions in your browser settings."
      );
      setHasPermission(false);
    }
  };

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
      console.error("Scanner error:", error);
      setCameraError("Scanner initialization failed. Try refreshing the page.");
    },
    paused: isLoading || scanResult !== null || !hasPermission,
    constraints: {
      video: {
        facingMode: "environment", // Use back camera on mobile
        width: { ideal: 1280 },
        height: { ideal: 720 },
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
      setEditedData(product);
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
    if (editedData) {
      console.log("✅ Adding food to log:", editedData);
      onFoodScanned(editedData);
    }
  };

  const handleTryAgain = () => {
    console.log("🔄 Resetting scanner");
    setError("");
    setScanResult(null);
    setEditedData(null);
    setLastScannedCode("");
  };

  const handleManualScan = () => {
    const code = prompt("Enter barcode number manually:");
    if (code && code.trim()) {
      console.log("⌨️ Manual barcode entry:", code);
      handleBarcodeScanned(code.trim());
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Show camera error if permission denied
  if (cameraError && !hasPermission) {
    return (
      <div className="space-y-6">
        <div className="text-center mt-12">
          <h2 className="text-xl font-bold text-gray-900">Scan Barcode</h2>
          <p className="text-gray-600">Camera access required</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium mb-2">
                Camera Access Denied
              </p>
              <p className="text-red-700 text-sm">{cameraError}</p>
              <p className="text-red-700 text-sm mt-2">
                To enable camera access:
              </p>
              <ul className="text-red-700 text-xs mt-1 ml-4 list-disc">
                <li>Tap the lock/info icon in your browser's address bar</li>
                <li>Enable camera permissions</li>
                <li>Refresh this page</li>
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={requestCameraPermission}
              className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
            >
              Retry Permission
            </button>
            <button
              onClick={onManualEntry}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
            >
              Manual Entry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">Scan Barcode</h2>
        <p className="text-gray-600">
          Point your camera at the product barcode
        </p>
      </div>

      {/* Scanner Video */}
      {!scanResult && hasPermission && (
        <div
          className="relative bg-black rounded-lg overflow-hidden"
          style={{ minHeight: "400px" }}
        >
          <video
            ref={ref}
            className="w-full h-full object-cover"
            style={{ minHeight: "400px" }}
            playsInline
            autoPlay
            muted
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
      {!scanResult && !error && !isLoading && hasPermission && (
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

      {/* Scan Result - Editable */}
      {scanResult && !isLoading && editedData && (
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
              <label className="text-sm text-gray-600 block mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={editedData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-sm text-gray-600 block mb-1">Brand</label>
              <input
                type="text"
                value={editedData.brand || ""}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="Optional"
                className="w-full font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Calories</div>
                <input
                  type="number"
                  value={editedData.calories || 0}
                  onChange={(e) =>
                    handleInputChange(
                      "calories",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 w-full text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Protein (g)</div>
                <input
                  type="number"
                  step="0.1"
                  value={editedData.protein || 0}
                  onChange={(e) =>
                    handleInputChange(
                      "protein",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 w-full text-center focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Carbs (g)</div>
                <input
                  type="number"
                  step="0.1"
                  value={editedData.carbs || 0}
                  onChange={(e) =>
                    handleInputChange("carbs", parseFloat(e.target.value) || 0)
                  }
                  className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 w-full text-center focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-xs text-gray-600 mb-1">Fats (g)</div>
                <input
                  type="number"
                  step="0.1"
                  value={editedData.fats || 0}
                  onChange={(e) =>
                    handleInputChange("fats", parseFloat(e.target.value) || 0)
                  }
                  className="text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 w-full text-center focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <label className="text-sm text-gray-600 block mb-1">
                Serving Size
              </label>
              <input
                type="text"
                value={editedData.servingSize || ""}
                onChange={(e) =>
                  handleInputChange("servingSize", e.target.value)
                }
                placeholder="e.g., 100g"
                className="w-full text-center font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
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
      {!scanResult && !isLoading && hasPermission && (
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
