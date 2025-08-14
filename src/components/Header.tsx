import React from 'react';
import { Truck, Bell, RefreshCw, Settings, Menu } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onSettings: () => void;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isRefreshing, onSettings, onMenuClick }) => {
  return (
    <div className="bg-emerald-600 text-white shadow-lg">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors mr-3"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="bg-white/20 p-2 rounded-lg mr-3">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Wellcreek Delivery</h1>
              <p className="text-emerald-100 text-sm">Cocktail Delivery Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onSettings}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};