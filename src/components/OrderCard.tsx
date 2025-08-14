import React from 'react';
import { Package, MapPin, Phone, Clock, DollarSign } from 'lucide-react';
import { SalesOrder } from '../types';

interface OrderCardProps {
  order: SalesOrder;
  onClick: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'to deliver and bill':
        return 'bg-blue-100 text-blue-800';
      case 'to deliver':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-3 active:scale-98 transition-transform cursor-pointer hover:shadow-md"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">#{order.name}</h3>
          <p className="text-gray-600 text-sm">{order.customer_name}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-gray-600 text-sm">
          <Clock className="w-4 h-4 mr-2 text-gray-400" />
          <span>Delivery: {formatDate(order.delivery_date)}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm">
          <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
          <span className="font-medium">KES {order.grand_total.toLocaleString()}</span>
        </div>

        <div className="flex items-center text-gray-600 text-sm">
          <Package className="w-4 h-4 mr-2 text-gray-400" />
          <span>{order.items?.length || 0} items</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-emerald-600 text-sm font-medium">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Ready for delivery</span>
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <Phone className="w-4 h-4 mr-1" />
            <span>Contact available</span>
          </div>
        </div>
      </div>
    </div>
  );
};