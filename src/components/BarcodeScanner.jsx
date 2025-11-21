// src/components/BarcodeScanner.jsx
import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Camera, X, Utensils } from "lucide-react";
import { searchOpenFoodFacts } from "../utils/storage";

const BarcodeScanner = ({ onFoodScanned, onManualEntry }) => {
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Initialize scanner only once
    if (!scannerRef.current && !isScanning) {
      setIsScanning(true);
      const scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          formatsToSupport: [Html5QrcodeScanner.ALL_SUPPORTED_FORMATS || 0],
        },
        false // verbose
      );

      scanner.render(
        (decodedText, decodedResult) => {
          // Success callback
          handleBarcodeScanned(decodedText);
        },
        (errorMessage) => {
          // Error callback - we can ignore most errors as they're just "no code found"
          // Only log actual errors, not "NotFoundException"
          if (!errorMessage.includes("NotFoundException")) {
            console.warn("Scanner error:", errorMessage);
          }
        }
      );

      scannerRef.current = scanner;
    }

    // Cleanup function
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .clear()
          .catch((err) => console.error("Failed to clear scanner:", err));
        scannerRef.current = null;
        setIsScanning(false);
      }
    };
  }, []);

  const handleBarcodeScanned = async (barcode) => {
    // Prevent multiple scans
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      // Stop scanner temporarily
      if (scannerRef.current) {
        await scannerRef.current.pause(true);
      }

      const product = await searchOpenFoodFacts(barcode);
      setScanResult(product);
    } catch (err) {
      setError(
        "Product not found. Try manual entry or scan a different product."
      );
      // Resume scanning after error
      if (scannerRef.current) {
        await scannerRef.current.resume();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFood = async () => {
    if (scanResult) {
      onFoodScanned(scanResult);
      // Reset and resume scanning
      setScanResult(null);
      if (scannerRef.current) {
        await scannerRef.current.resume();
      }
    }
  };

  const handleTryAgain = async () => {
    setError("");
    setScanResult(null);
    if (scannerRef.current) {
      await scannerRef.current.resume();
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
      {!scanResult && (
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <div id="reader" className="w-full"></div>
        </div>
      )}

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
              onClick={handleTryAgain}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Scan Result */}
      {scanResult && !isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-lg text-gray-900">Product Found</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-900">{scanResult.name}</span>
            </div>
            {scanResult.brand && (
              <div>
                <span className="font-medium text-gray-700">Brand:</span>
                <span className="ml-2 text-gray-900">{scanResult.brand}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm mt-4">
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-600">Calories:</span>
                <div className="font-semibold text-lg">
                  {Math.round(scanResult.calories) || 0}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-600">Protein:</span>
                <div className="font-semibold text-lg">
                  {scanResult.protein?.toFixed(1) || 0}g
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-600">Carbs:</span>
                <div className="font-semibold text-lg">
                  {scanResult.carbs?.toFixed(1) || 0}g
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-600">Fats:</span>
                <div className="font-semibold text-lg">
                  {scanResult.fats?.toFixed(1) || 0}g
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleAddFood}
              className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Add to Today's Log
            </button>
            <button
              onClick={handleTryAgain}
              className="px-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-colors"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* Manual Entry Fallback */}
      {!scanResult && (
        <button
          onClick={onManualEntry}
          className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:border-gray-400 transition-colors"
        >
          <Utensils className="w-5 h-5" />
          <span>Enter Food Manually</span>
        </button>
      )}
    </div>
  );
};

export default BarcodeScanner;
