import React from 'react';
import { Package, CreditCard, X, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  currentPage: 'orders' | 'payments' | 'settings';
  onPageChange: (page: 'orders' | 'payments' | 'settings') => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentPage, onPageChange, onClose }) => {
  const menuItems = [
    {
      id: 'orders' as const,
      label: 'Orders',
      icon: Package,
      description: 'View and manage delivery orders'
    },
    {
      id: 'payments' as const,
      label: 'Payments',
      icon: CreditCard,
      description: 'View collected payments'
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      description: 'App configuration'
    }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  onClose();
                }}
                className={`w-full flex items-center p-4 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-800' 
                    : 'hover:bg-gray-50 border-2 border-transparent text-gray-700'
                }`}
              >
                <Icon className={`w-6 h-6 mr-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`font-medium ${isActive ? 'text-emerald-800' : 'text-gray-900'}`}>
                    {item.label}
                  </p>
                  <p className={`text-sm ${isActive ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">Delivery App v1.0</p>
            <p className="text-xs text-gray-400 mt-1">Wellcreek Coffee</p>
          </div>
        </div>
      </div>
    </>
  );
};
