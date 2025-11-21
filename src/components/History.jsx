// src/components/History.js
import React, { useState, useEffect } from 'react';
import { localForage } from '../utils/storage';
import { Calendar, ArrowLeft } from 'lucide-react';

const History = ({ onBack }) => {
const [pastLogs, setPastLogs] = useState([]);

useEffect(() => {
loadPastLogs();
}, []);

const loadPastLogs = async () => {
// We'll load the last 7 days of logs
const logs = [];
for (let i = 0; i < 7; i++) {
const date = new Date();
date.setDate(date.getDate() - i);
const dateString = date.toDateString();
const log = await localForage.getItem(`foodLog_${dateString}`);
if (log && log.length > 0) {
logs.push({
date: dateString,
log: log
});
}
}
setPastLogs(logs);
};

const calculateDayTotals = (log) => {
return log.reduce((totals, item) => ({
calories: totals.calories + (item.calories || 0),
protein: totals.protein + (item.protein || 0),
carbs: totals.carbs + (item.carbs || 0),
fats: totals.fats + (item.fats || 0)
}), { calories: 0, protein: 0, carbs: 0, fats: 0 });
};

return (
<div className="space-y-6">
<div className="flex items-center space-x-4">
<button onClick={onBack} className="p-2">
<ArrowLeft className="w-5 h-5" />
</button>
<h2 className="text-xl font-bold text-gray-900">History</h2>
</div>

      {pastLogs.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No past logs found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pastLogs.map((day, index) => {
            const totals = calculateDayTotals(day.log);
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{day.date}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <div className="font-semibold">{totals.calories.toFixed(0)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <div className="font-semibold">{totals.protein.toFixed(1)}g</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <div className="font-semibold">{totals.carbs.toFixed(1)}g</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Fats:</span>
                    <div className="font-semibold">{totals.fats.toFixed(1)}g</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  {day.log.length} food(s) logged
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

);
};

export default History;