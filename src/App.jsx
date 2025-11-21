// src/App.jsx
import React, { useState, useEffect } from "react";
import { localForage } from "./utils/storage";
import Dashboard from "./components/Dashboard";
import BarcodeScanner from "./components/BarcodeScanner";
import FoodLogger from "./components/FoodLogger";
import MealPlanner from "./components/MealPlanner";
import Onboarding from "./components/Onboarding";
import Navigation from "./components/Navigation";
import History from "./components/History";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const [dailyLog, setDailyLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
    loadTodaysLog();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await localForage.getItem("userData");
      if (user) {
        setUserData(user);
      } else {
        setCurrentView("onboarding");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTodaysLog = async () => {
    try {
      const today = new Date().toDateString();
      const log = (await localForage.getItem(`foodLog_${today}`)) || [];
      setDailyLog(log);
    } catch (error) {
      console.error("Error loading food log:", error);
    }
  };

  const handleOnboardingComplete = (userData) => {
    setUserData(userData);
    setCurrentView("dashboard");
    localForage.setItem("userData", userData);
  };

  const addFoodToLog = async (foodItem) => {
    const today = new Date().toDateString();
    const updatedLog = [
      ...dailyLog,
      {
        ...foodItem,
        id: Date.now(),
        timestamp: new Date().toISOString(),
      },
    ];

    setDailyLog(updatedLog);
    await localForage.setItem(`foodLog_${today}`, updatedLog);

    // Go back to dashboard after adding
    setCurrentView("dashboard");
  };

  const removeFoodFromLog = async (foodId) => {
    const today = new Date().toDateString();
    const updatedLog = dailyLog.filter((item) => item.id !== foodId);

    setDailyLog(updatedLog);
    await localForage.setItem(`foodLog_${today}`, updatedLog);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData && currentView !== "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-sm">
        {currentView !== "onboarding" && (
          <Navigation currentView={currentView} onViewChange={setCurrentView} />
        )}

        <main className="p-4 pb-20">
          {currentView === "onboarding" && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}
          {currentView === "dashboard" && (
            <Dashboard
              userData={userData}
              dailyLog={dailyLog}
              onAddFood={() => setCurrentView("scanner")}
              onRemoveFood={removeFoodFromLog}
            />
          )}
          {currentView === "scanner" && (
            <BarcodeScanner
              onFoodScanned={addFoodToLog}
              onManualEntry={() => setCurrentView("logger")}
            />
          )}
          {currentView === "logger" && (
            <FoodLogger onFoodAdded={addFoodToLog} />
          )}
          {currentView === "planner" && <MealPlanner userData={userData} />}
          {currentView === "history" && (
            <History onBack={() => setCurrentView("dashboard")} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
