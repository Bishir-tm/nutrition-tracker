// src/components/Navigation.js
import React from 'react';
import { Home, Utensils, History, Camera } from 'lucide-react';

const Navigation = ({ currentView, onViewChange }) => {
const navItems = [
{ id: 'dashboard', label: 'Dashboard', icon: Home },
{ id: 'planner', label: 'Meal Plan', icon: Utensils },
{ id: 'scanner', label: 'Scan', icon: Camera },
{ id: 'history', label: 'History', icon: History },
];

return (
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4">
<div className="flex justify-around items-center">
{navItems.map((item) => {
const Icon = item.icon;
return (
<button
key={item.id}
onClick={() => onViewChange(item.id)}
className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'text-black'
                  : 'text-gray-500'
              }`} >
<Icon className="w-6 h-6" />
<span className="text-xs mt-1">{item.label}</span>
</button>
);
})}
</div>
</nav>
);
};

export default Navigation;